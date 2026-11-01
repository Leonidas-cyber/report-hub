import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel } from '@/utils/exportExcel';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsTable } from '@/components/ReportsTable';
import { ReportsGrid } from '@/components/ReportsGrid';
import { AdminHeader } from '@/components/AdminHeader';
import { SuperAdminPanel } from '@/components/SuperAdminPanel';
import { AttendanceForm } from '@/components/AttendanceForm';
import { AttendanceStats } from '@/components/AttendanceStats';
import { useServiceReports } from '@/hooks/useServiceReports';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { useAuth } from '@/contexts/AuthContext';
import { getPreviousMonth, getPreviousMonthYear } from '@/types/report';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  LayoutGrid,
  Search,
  ShieldCheck,
  Table2,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import {
  GROUP_OVERSEERS,
  findCongregationMemberByName,
  findSimilarMembers,
  getCongregationRoster,
  normalizePersonName,
  type CongregationMember,
} from '@/data/congregationRoster';

interface NameMappingRow {
  alias_normalized: string;
  canonical_full_name: string;
  updated_at?: string;
}

interface ReportReviewFlagRow {
  report_id: string;
  is_duplicate: boolean;
  canonical_full_name: string | null;
  note: string | null;
  updated_at?: string;
}

const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205']);

// Se reemplazó 'padron' por 'faltantes'
type AdminSection = 'seguimiento' | 'faltantes' | 'informes' | 'asistencia' | 'superadmin';

const Admin = () => {
  const { user, isSuperAdmin, refreshAdminRole } = useAuth();
  const { reports, loading, updateReport, deleteReport, refetch } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeSection, setActiveSection] = useState<AdminSection>('seguimiento');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  // Filtros de la nueva sección "Faltan por enviar"
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [missingSearchQuery, setMissingSearchQuery] = useState<string>('');
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  // Mapeos guardados en BD (opcionales si existen)
  const [nameMappings, setNameMappings] = useState<NameMappingRow[]>([]);
  const [reportFlagsById, setReportFlagsById] = useState<Record<string, ReportReviewFlagRow>>({});

  const targetMonth = getPreviousMonth();
  const targetYear = getPreviousMonthYear();

  const fetchAdjustments = useCallback(async () => {
    try {
      const [mappingsRes, flagsRes] = await Promise.all([
        (supabase as any)
          .from('report_admin_name_mappings')
          .select('alias_normalized, canonical_full_name, updated_at'),
        (supabase as any)
          .from('report_admin_report_flags')
          .select('report_id, is_duplicate, canonical_full_name, note, updated_at'),
      ]);

      if (mappingsRes.error && !MISSING_TABLE_CODES.has(mappingsRes.error.code)) {
        throw mappingsRes.error;
      }
      if (flagsRes.error && !MISSING_TABLE_CODES.has(flagsRes.error.code)) {
        throw flagsRes.error;
      }

      setNameMappings((mappingsRes.data ?? []) as NameMappingRow[]);
      const flags = ((flagsRes.data ?? []) as ReportReviewFlagRow[]).reduce<Record<string, ReportReviewFlagRow>>(
        (acc, row) => {
          acc[row.report_id] = row;
          return acc;
        },
        {}
      );
      setReportFlagsById(flags);
    } catch (error) {
      console.error('Error loading report flags:', error);
    }
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const roster: CongregationMember[] = useMemo(() => getCongregationRoster(), []);
  const totalExpected = roster.length;

  const allGroups = useMemo(() => {
    const groups = new Set<number>(roster.map((m) => m.groupNumber));
    return Array.from(groups).sort((a, b) => a - b);
  }, [roster]);

  const sortedSuperintendents = useMemo(() => {
    return [...superintendents].sort((a, b) => {
      if (a.group_number !== b.group_number) return a.group_number - b.group_number;
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }, [superintendents]);

  const reportsForTargetMonth = useMemo(
    () => reports.filter((r) => r.month === targetMonth && r.year === targetYear),
    [reports, targetMonth, targetYear]
  );

  const aliasToCanonicalKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of nameMappings) {
      map.set(row.alias_normalized, normalizePersonName(row.canonical_full_name));
    }
    return map;
  }, [nameMappings]);

  // Cruce inteligente de informes enviados vs. los hermanos
  const effectiveLatestByCanonical = useMemo(() => {
    const map = new Map<string, (typeof reportsForTargetMonth)[number]>();

    for (const report of reportsForTargetMonth) {
      const flag = reportFlagsById[report.id];
      if (flag?.is_duplicate) continue;

      const rawKey = normalizePersonName(report.fullName);
      if (!rawKey) continue;

      let canonicalKey: string | null = null;

      if (flag?.canonical_full_name) {
        canonicalKey = normalizePersonName(flag.canonical_full_name);
      } else if (aliasToCanonicalKey.has(rawKey)) {
        canonicalKey = aliasToCanonicalKey.get(rawKey)!;
      } else {
        const matchedMember = findCongregationMemberByName(
          report.fullName,
          report.superintendentGroupNumber
        );
        if (matchedMember) {
          canonicalKey = normalizePersonName(matchedMember.fullName);
        } else {
          const groupCandidates = report.superintendentGroupNumber
            ? roster.filter((m) => m.groupNumber === report.superintendentGroupNumber)
            : roster;
          const fuzzy = findSimilarMembers(report.fullName, groupCandidates, 1, 0.78);
          if (fuzzy.length > 0) {
            canonicalKey = normalizePersonName(fuzzy[0].member.fullName);
          } else {
            canonicalKey = rawKey;
          }
        }
      }

      const previous = map.get(canonicalKey);
      if (!previous) {
        map.set(canonicalKey, report);
        continue;
      }

      const previousTs = new Date(previous.submittedAt).getTime();
      const currentTs = new Date(report.submittedAt).getTime();
      if (currentTs >= previousTs) {
        map.set(canonicalKey, report);
      }
    }

    return map;
  }, [reportsForTargetMonth, reportFlagsById, aliasToCanonicalKey, roster]);

  const rosterStatus = useMemo(() => {
    return roster.map((member) => {
      const key = normalizePersonName(member.fullName);
      const report = effectiveLatestByCanonical.get(key);
      const selectedGroup = report?.superintendentGroupNumber ?? null;
      const hasWrongGroup = Boolean(
        report && typeof selectedGroup === 'number' && selectedGroup !== member.groupNumber
      );

      return {
        member,
        report,
        selectedGroup,
        hasWrongGroup,
      };
    });
  }, [roster, effectiveLatestByCanonical]);

  const submittedKnownCount = useMemo(
    () => rosterStatus.filter((item) => Boolean(item.report)).length,
    [rosterStatus]
  );

  const missingMembers = useMemo(
    () => rosterStatus.filter((item) => !item.report).map((item) => item.member),
    [rosterStatus]
  );

  const wrongGroupMembers = useMemo(
    () => rosterStatus.filter((item) => item.hasWrongGroup),
    [rosterStatus]
  );

  const missingCount = missingMembers.length;
  const progressPercent =
    totalExpected > 0
      ? Math.round((Math.min(submittedKnownCount, totalExpected) / totalExpected) * 100)
      : 0;

  // Filtrado de faltantes por Grupo y por Búsqueda
  const filteredMissingMembers = useMemo(() => {
    const queryNorm = normalizePersonName(missingSearchQuery);

    return missingMembers.filter((member) => {
      const matchesGroup =
        selectedGroupFilter === 'all' || String(member.groupNumber) === selectedGroupFilter;

      if (!matchesGroup) return false;
      if (!queryNorm) return true;

      const searchableText = normalizePersonName(
        [
          member.fullName,
          member.legalName ?? '',
          member.marriedSurname ?? '',
          ...(member.aliases ?? []),
        ].join(' ')
      );

      return searchableText.includes(queryNorm);
    });
  }, [missingMembers, selectedGroupFilter, missingSearchQuery]);

  const missingByGroup = useMemo(() => {
    const grouped: Record<number, CongregationMember[]> = {};
    for (const member of filteredMissingMembers) {
      if (!grouped[member.groupNumber]) {
        grouped[member.groupNumber] = [];
      }
      grouped[member.groupNumber].push(member);
    }
    return grouped;
  }, [filteredMissingMembers]);

  const groupScopeStats = useMemo(() => {
    const totalInScope =
      selectedGroupFilter === 'all'
        ? roster.length
        : roster.filter((m) => String(m.groupNumber) === selectedGroupFilter).length;

    const missingInScope =
      selectedGroupFilter === 'all'
        ? missingMembers.length
        : missingMembers.filter((m) => String(m.groupNumber) === selectedGroupFilter).length;

    const submittedInScope = Math.max(0, totalInScope - missingInScope);
    const rate = totalInScope > 0 ? Math.round((submittedInScope / totalInScope) * 100) : 0;

    return { totalInScope, missingInScope, submittedInScope, rate };
  }, [roster, missingMembers, selectedGroupFilter]);

  const handleCopyGroupMissing = (groupNum: number, members: CongregationMember[]) => {
    const overseer = GROUP_OVERSEERS[groupNum] ? ` (${GROUP_OVERSEERS[groupNum]})` : '';
    const text =
      `*Faltan por enviar informe - Grupo ${groupNum}${overseer}* [${members.length}]:\n` +
      members.map((m, idx) => `${idx + 1}. ${m.fullName}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedGroup(String(groupNum));
    toast.success(`Lista del Grupo ${groupNum} copiada al portapapeles`);
    setTimeout(() => setCopiedGroup(null), 2000);
  };

  const handleCopyAllFilteredMissing = () => {
    const entries = Object.entries(missingByGroup).sort(([a], [b]) => Number(a) - Number(b));
    if (entries.length === 0) return;

    const blocks = entries.map(([gKey, members]) => {
      const gNum = Number(gKey);
      const overseer = GROUP_OVERSEERS[gNum] ? ` — ${GROUP_OVERSEERS[gNum]}` : '';
      const list = members.map((m, i) => `  ${i + 1}. ${m.fullName}`).join('\n');
      return `*Grupo ${gNum}${overseer}* (${members.length} pendientes):\n${list}`;
    });

    navigator.clipboard.writeText(blocks.join('\n\n'));
    toast.success(`Se copiaron ${filteredMissingMembers.length} pendientes al portapapeles`);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.race([
        Promise.resolve(refetch()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      await fetchAdjustments();
      toast.success('Datos actualizados');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      toast.error('No se pudo actualizar. Intenta de nuevo.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      exportToExcel(reports, 'informes_arrayanes');
      toast.success('Archivo Excel generado');
    } catch (error) {
      console.error('Error exporting excel:', error);
      toast.error('No se pudo exportar a Excel');
    }
  };

  const handleClearDatabase = async () => {
    await refreshAdminRole();

    if (!isSuperAdmin) {
      toast.error('Solo un super administrador puede borrar todos los informes');
      return;
    }

    try {
      const { error } = await (supabase.rpc as any)('clear_all_service_reports');
      if (error) throw error;

      await refetch();
      await fetchAdjustments();
      toast.success('Base de datos limpiada correctamente');
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('No se pudo borrar la base de datos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AdminHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onClearDatabase={handleClearDatabase}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-8 overflow-x-hidden">
        <Tabs
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as AdminSection)}
          className="space-y-5"
        >
          <Card className="shadow-card">
            <CardContent className="p-3">
              <TabsList className="h-auto w-full flex flex-wrap justify-start gap-2 bg-muted/40">
                <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                <TabsTrigger value="faltantes" className="gap-1.5">
                  <span>Faltan por enviar</span>
                  <Badge
                    variant={missingCount > 0 ? 'destructive' : 'secondary'}
                    className="px-1.5 py-0 text-xs"
                  >
                    {missingCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="informes">Informes</TabsTrigger>
                <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
                <TabsTrigger value="superadmin">Super Admin</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* SECCIÓN 1: SEGUIMIENTO */}
          <TabsContent value="seguimiento">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Seguimiento mensual de informes</CardTitle>
                    <CardDescription>
                      Periodo: <b>{targetMonth} {targetYear}</b> · Total esperado: <b>{totalExpected}</b> publicadores
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection('faltantes')}
                    className="self-start sm:self-auto"
                  >
                    <UserX className="h-4 w-4 mr-2 text-destructive" />
                    Ver quiénes faltan por grupo ({missingCount})
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" /> Total esperado
                    </p>
                    <p className="text-3xl font-bold mt-1">{totalExpected}</p>
                  </div>

                  <div className="rounded-xl border border-success/40 bg-success/10 p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-success" /> Ya enviaron
                    </p>
                    <p className="text-3xl font-bold mt-1 text-success">{submittedKnownCount}</p>
                  </div>

                  <div
                    onClick={() => setActiveSection('faltantes')}
                    className="rounded-xl border border-warning/40 bg-warning/10 p-4 cursor-pointer hover:bg-warning/15 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <UserX className="h-4 w-4 text-warning" /> Faltan por enviar
                    </p>
                    <p className="text-3xl font-bold mt-1 text-amber-700 dark:text-amber-400">
                      {missingCount}
                    </p>
                  </div>

                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" /> Grupo distinto
                    </p>
                    <p className="text-3xl font-bold mt-1 text-destructive">
                      {wrongGroupMembers.length}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso de entrega</span>
                    <span className="font-semibold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 2: FALTAN POR ENVIAR (REEMPLAZO DE PADRÓN) */}
          <TabsContent value="faltantes" className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="shadow-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total en{' '}
                      {selectedGroupFilter === 'all'
                        ? 'los 6 grupos'
                        : `Grupo ${selectedGroupFilter} (${GROUP_OVERSEERS[Number(selectedGroupFilter)]})`}
                    </p>
                    <p className="text-2xl font-bold mt-1">{groupScopeStats.totalInScope}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ya enviaron ({groupScopeStats.rate}%)
                    </p>
                    <p className="text-2xl font-bold mt-1 text-success">
                      {groupScopeStats.submittedInScope}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-destructive/40">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faltan por enviar</p>
                    <p className="text-2xl font-bold mt-1 text-destructive">
                      {groupScopeStats.missingInScope}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <UserX className="h-5 w-5 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserX className="h-5 w-5 text-destructive" />
                      Quiénes faltan por enviar su informe ({targetMonth} {targetYear})
                    </CardTitle>
                    <CardDescription>
                      Filtra por grupo o busca por nombre de pila, apellido o apellido de casada.
                    </CardDescription>
                  </div>

                  {filteredMissingMembers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAllFilteredMissing}
                      className="self-start md:self-auto"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copiar pendientes ({filteredMissingMembers.length})
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-72">
                    <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todos los grupos ({missingCount} pendientes)
                        </SelectItem>
                        {allGroups.map((groupNum) => {
                          const groupMissingCount = missingMembers.filter(
                            (m) => m.groupNumber === groupNum
                          ).length;
                          return (
                            <SelectItem key={groupNum} value={String(groupNum)}>
                              Grupo {groupNum} — {GROUP_OVERSEERS[groupNum]} ({groupMissingCount})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre de pila, apellido o apellido de casada..."
                      value={missingSearchQuery}
                      onChange={(e) => setMissingSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedGroupFilter === 'all' ? 'default' : 'outline'}
                    className="h-8 text-xs"
                    onClick={() => setSelectedGroupFilter('all')}
                  >
                    Todos ({missingCount})
                  </Button>
                  {allGroups.map((groupNum) => {
                    const countInGroup = missingMembers.filter(
                      (m) => m.groupNumber === groupNum
                    ).length;
                    return (
                      <Button
                        key={groupNum}
                        type="button"
                        size="sm"
                        variant={selectedGroupFilter === String(groupNum) ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        onClick={() => setSelectedGroupFilter(String(groupNum))}
                      >
                        Grupo {groupNum}: {GROUP_OVERSEERS[groupNum]} ({countInGroup})
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {filteredMissingMembers.length === 0 ? (
              <Card className="shadow-card border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-success mb-3" />
                  <h3 className="text-lg font-semibold">
                    {missingSearchQuery.trim()
                      ? 'No se encontraron coincidencias'
                      : '¡Todos los informes entregados!'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    {missingSearchQuery.trim()
                      ? `Ningún publicador pendiente coincide con "${missingSearchQuery}".`
                      : selectedGroupFilter === 'all'
                        ? 'Todos los publicadores de la congregación ya enviaron su informe.'
                        : `Todos los integrantes del Grupo ${selectedGroupFilter} (${GROUP_OVERSEERS[Number(selectedGroupFilter)]}) ya enviaron su informe.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(missingByGroup)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([groupKey, members]) => {
                    const groupNum = Number(groupKey);
                    const totalInGroup = roster.filter((m) => m.groupNumber === groupNum).length;

                    return (
                      <Card key={groupNum} className="shadow-card flex flex-col">
                        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 border-b bg-muted/20">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-semibold">
                                Grupo {groupNum}
                              </CardTitle>
                              <Badge variant="destructive" className="text-xs">
                                Faltan {members.length} de {totalInGroup}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Capitán: {GROUP_OVERSEERS[groupNum]}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs shrink-0"
                            onClick={() => handleCopyGroupMissing(groupNum, members)}
                            title="Copiar lista para WhatsApp"
                          >
                            {copiedGroup === String(groupNum) ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-success mr-1" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </CardHeader>

                        <CardContent className="pt-3 flex-1">
                          <ol className="divide-y divide-border text-sm">
                            {members.map((member, idx) => (
                              <li
                                key={`${groupNum}-${member.fullName}`}
                                className="py-2.5 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-5 tabular-nums shrink-0">
                                      {idx + 1}.
                                    </span>
                                    <span className="font-medium truncate">
                                      {member.fullName}
                                    </span>
                                  </div>
                                  {member.legalName &&
                                    normalizePersonName(member.legalName) !==
                                      normalizePersonName(member.fullName) && (
                                      <p className="text-xs text-muted-foreground pl-7 truncate">
                                        {member.legalName}
                                        {member.marriedSurname ? ` (${member.marriedSurname})` : ''}
                                      </p>
                                    )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[11px] text-destructive border-destructive/30 shrink-0"
                                >
                                  Pendiente
                                </Badge>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* SECCIÓN 3: ASISTENCIA */}
          <TabsContent value="asistencia">
            <Card className="shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl">Sección de asistencia</CardTitle>
                <CardDescription>
                  Registro de asistencia y visualización de estadísticas por reunión.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-1 min-w-0">
                    <AttendanceForm onSuccess={() => setAttendanceRefreshKey((prev) => prev + 1)} />
                  </div>
                  <div className="xl:col-span-2 min-w-0" key={attendanceRefreshKey}>
                    <AttendanceStats />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 4: INFORMES */}
          <TabsContent value="informes">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Gestión de Informes</CardTitle>
                    <CardDescription>
                      Administra y revisa los informes de servicio enviados
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <Table2 className="h-4 w-4 mr-2" />
                      Tabla
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Tarjetas
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {viewMode === 'table' ? (
                  <ReportsTable
                    reports={reports}
                    superintendents={sortedSuperintendents}
                    onUpdateReport={updateReport}
                  />
                ) : (
                  <ReportsGrid
                    reports={reports}
                    superintendents={sortedSuperintendents}
                    onUpdateReport={updateReport}
                    onDeleteReport={deleteReport}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 5: SUPER ADMIN */}
          <TabsContent value="superadmin">
            {isSuperAdmin ? (
              <SuperAdminPanel currentUserId={user?.id} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4" />
                    Funciones de super administrador
                  </CardTitle>
                  <CardDescription>
                    Este bloque se habilita únicamente para cuentas con rol <b>super_admin</b>.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
