import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel } from '@/utils/exportExcel';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
  LayoutGrid,
  ListChecks,
  ShieldCheck,
  Table2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import {
  findCongregationMemberByName,
  getCongregationRoster,
  normalizePersonName,
} from '@/data/congregationRoster';

const BASE_EXPECTED_REPORTERS = 94;

interface NameMappingRow {
  alias_normalized: string;
  canonical_full_name: string;
  updated_at?: string;
}

interface CustomRosterMemberRow {
  id: string;
  full_name: string;
  group_number: number;
  is_active: boolean;
  created_at?: string;
}

interface ReportReviewFlagRow {
  report_id: string;
  is_duplicate: boolean;
  canonical_full_name: string | null;
  note: string | null;
  updated_at?: string;
}

const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205']);

type AdminSection = 'seguimiento' | 'asistencia' | 'padron' | 'informes' | 'superadmin';

const Admin = () => {
  const { user, isSuperAdmin } = useAuth();
  const { reports, loading, updateReport, deleteReport, refetch } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeSection, setActiveSection] = useState<AdminSection>('seguimiento');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  // Ajustes administrativos de padrón/duplicados.
  const [nameMappings, setNameMappings] = useState<NameMappingRow[]>([]);
  const [customMembers, setCustomMembers] = useState<CustomRosterMemberRow[]>([]);
  const [reportFlagsById, setReportFlagsById] = useState<Record<string, ReportReviewFlagRow>>({});
  const [adjustmentsLoading, setAdjustmentsLoading] = useState(false);

  // Controles UI por reporte "no encontrado"
  const [selectedCanonicalByReportId, setSelectedCanonicalByReportId] = useState<Record<string, string>>({});
  const [selectedGroupByReportId, setSelectedGroupByReportId] = useState<Record<string, number>>({});
  const [busyReportId, setBusyReportId] = useState<string | null>(null);

  // Alta manual de padrón
  const [manualMemberName, setManualMemberName] = useState('');
  const [manualMemberGroup, setManualMemberGroup] = useState<number>(1);

  const targetMonth = getPreviousMonth();
  const targetYear = getPreviousMonthYear();

  const fetchAdjustments = useCallback(async () => {
    setAdjustmentsLoading(true);
    try {
      const [mappingsRes, customRes, flagsRes] = await Promise.all([
        (supabase as any)
          .from('report_admin_name_mappings')
          .select('alias_normalized, canonical_full_name, updated_at'),
        (supabase as any)
          .from('report_admin_custom_members')
          .select('id, full_name, group_number, is_active, created_at')
          .eq('is_active', true)
          .order('group_number', { ascending: true })
          .order('full_name', { ascending: true }),
        (supabase as any)
          .from('report_admin_report_flags')
          .select('report_id, is_duplicate, canonical_full_name, note, updated_at'),
      ]);

      if (mappingsRes.error && !MISSING_TABLE_CODES.has(mappingsRes.error.code)) {
        throw mappingsRes.error;
      }
      if (customRes.error && !MISSING_TABLE_CODES.has(customRes.error.code)) {
        throw customRes.error;
      }
      if (flagsRes.error && !MISSING_TABLE_CODES.has(flagsRes.error.code)) {
        throw flagsRes.error;
      }

      setNameMappings((mappingsRes.data ?? []) as NameMappingRow[]);
      setCustomMembers((customRes.data ?? []) as CustomRosterMemberRow[]);
      const flags = ((flagsRes.data ?? []) as ReportReviewFlagRow[]).reduce<Record<string, ReportReviewFlagRow>>(
        (acc, row) => {
          acc[row.report_id] = row;
          return acc;
        },
        {}
      );
      setReportFlagsById(flags);
    } catch (error) {
      console.error('Error loading roster adjustments:', error);
      toast.error('No se pudieron cargar los ajustes de padrón.');
    } finally {
      setAdjustmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const baseRoster = useMemo(() => getCongregationRoster(), []);

  const roster = useMemo(() => {
    const map = new Map<string, { fullName: string; groupNumber: number }>();

    for (const member of baseRoster) {
      map.set(normalizePersonName(member.fullName), member);
    }

    for (const member of customMembers) {
      if (!member.is_active) continue;
      map.set(normalizePersonName(member.full_name), {
        fullName: member.full_name,
        groupNumber: member.group_number,
      });
    }

    return Array.from(map.values());
  }, [baseRoster, customMembers]);

  const additionalCustomMembers = useMemo(
    () =>
      customMembers.filter(
        (member) => member.is_active && !findCongregationMemberByName(member.full_name)
      ).length,
    [customMembers]
  );

  const totalExpected = BASE_EXPECTED_REPORTERS + additionalCustomMembers;

  const rosterKeySet = useMemo(
    () => new Set(roster.map((member) => normalizePersonName(member.fullName))),
    [roster]
  );

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

  // Por nombre enviado (original), toma el más reciente.
  const latestReportBySubmitter = useMemo(() => {
    const map = new Map<string, (typeof reportsForTargetMonth)[number]>();

    for (const report of reportsForTargetMonth) {
      const key = normalizePersonName(report.fullName);
      if (!key) continue;

      const previous = map.get(key);
      if (!previous) {
        map.set(key, report);
        continue;
      }

      const previousTs = new Date(previous.submittedAt).getTime();
      const currentTs = new Date(report.submittedAt).getTime();
      if (currentTs >= previousTs) {
        map.set(key, report);
      }
    }

    return map;
  }, [reportsForTargetMonth]);

  const aliasToCanonicalKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of nameMappings) {
      map.set(row.alias_normalized, normalizePersonName(row.canonical_full_name));
    }
    return map;
  }, [nameMappings]);

  // Mapa efectivo por persona canónica:
  // - ignora duplicados marcados
  // - aplica alias o "otra persona"
  const effectiveLatestByCanonical = useMemo(() => {
    const map = new Map<string, (typeof reportsForTargetMonth)[number]>();

    for (const report of latestReportBySubmitter.values()) {
      const flag = reportFlagsById[report.id];
      if (flag?.is_duplicate) continue;

      const rawKey = normalizePersonName(report.fullName);
      const canonicalFromFlag = flag?.canonical_full_name
        ? normalizePersonName(flag.canonical_full_name)
        : null;
      const canonicalKey = canonicalFromFlag || aliasToCanonicalKey.get(rawKey) || rawKey;

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
  }, [latestReportBySubmitter, reportFlagsById, aliasToCanonicalKey, reportsForTargetMonth]);

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

  const missingMembers = useMemo(() => rosterStatus.filter((item) => !item.report), [rosterStatus]);
  const wrongGroupMembers = useMemo(() => rosterStatus.filter((item) => item.hasWrongGroup), [rosterStatus]);

  const unresolvedUnknownSubmitters = useMemo(() => {
    const values = Array.from(latestReportBySubmitter.values());
    return values.filter((report) => {
      const flag = reportFlagsById[report.id];
      if (flag?.is_duplicate) return false;

      const rawKey = normalizePersonName(report.fullName);
      const canonicalFromFlag = flag?.canonical_full_name
        ? normalizePersonName(flag.canonical_full_name)
        : null;
      const canonicalKey = canonicalFromFlag || aliasToCanonicalKey.get(rawKey) || rawKey;

      return !rosterKeySet.has(canonicalKey);
    });
  }, [latestReportBySubmitter, reportFlagsById, aliasToCanonicalKey, rosterKeySet]);

  const duplicateMarkedReports = useMemo(() => {
    const values = Array.from(latestReportBySubmitter.values());
    return values.filter((report) => reportFlagsById[report.id]?.is_duplicate);
  }, [latestReportBySubmitter, reportFlagsById]);

  const missingCount = Math.max(totalExpected - submittedKnownCount, 0);
  const progressPercent = totalExpected > 0 ? Math.round((Math.min(submittedKnownCount, totalExpected) / totalExpected) * 100) : 0;
  const missingMembersDisplay = useMemo(
    () => missingMembers.slice(0, missingCount),
    [missingMembers, missingCount]
  );

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

  const handleMarkAsDuplicate = async (reportId: string) => {
    setBusyReportId(reportId);
    try {
      const payload = {
        report_id: reportId,
        is_duplicate: true,
        canonical_full_name: null,
        note: 'Marcado como duplicado por administración',
        updated_by: user?.id ?? null,
      };

      const { error } = await (supabase as any)
        .from('report_admin_report_flags')
        .upsert(payload, { onConflict: 'report_id' });

      if (error) throw error;
      await fetchAdjustments();
      toast.success('Marcado como duplicado');
    } catch (error) {
      console.error('Error marking duplicate:', error);
      toast.error('No se pudo marcar como duplicado');
    } finally {
      setBusyReportId(null);
    }
  };

  const handleUnmarkDuplicate = async (reportId: string) => {
    setBusyReportId(reportId);
    try {
      const { error } = await (supabase as any)
        .from('report_admin_report_flags')
        .delete()
        .eq('report_id', reportId);

      if (error) throw error;
      await fetchAdjustments();
      toast.success('Duplicado retirado');
    } catch (error) {
      console.error('Error removing duplicate:', error);
      toast.error('No se pudo quitar la marca de duplicado');
    } finally {
      setBusyReportId(null);
    }
  };

  const handleMapAsOtherPerson = async (reportId: string, rawName: string) => {
    const canonicalFullName = selectedCanonicalByReportId[reportId];
    if (!canonicalFullName) {
      toast.error('Selecciona primero el nombre correcto del padrón.');
      return;
    }

    setBusyReportId(reportId);
    try {
      const aliasNormalized = normalizePersonName(rawName);

      const mappingPayload = {
        alias_normalized: aliasNormalized,
        canonical_full_name: canonicalFullName,
        updated_by: user?.id ?? null,
      };

      const flagPayload = {
        report_id: reportId,
        is_duplicate: false,
        canonical_full_name: canonicalFullName,
        note: 'Corregido como otra persona del padrón',
        updated_by: user?.id ?? null,
      };

      const [mappingRes, flagRes] = await Promise.all([
        (supabase as any)
          .from('report_admin_name_mappings')
          .upsert(mappingPayload, { onConflict: 'alias_normalized' }),
        (supabase as any)
          .from('report_admin_report_flags')
          .upsert(flagPayload, { onConflict: 'report_id' }),
      ]);

      if (mappingRes.error) throw mappingRes.error;
      if (flagRes.error) throw flagRes.error;

      await fetchAdjustments();
      toast.success('Se relacionó correctamente con el padrón');
    } catch (error) {
      console.error('Error mapping alias:', error);
      toast.error('No se pudo guardar la corrección');
    } finally {
      setBusyReportId(null);
    }
  };

  const handleAddUnknownToRoster = async (
    reportId: string,
    fullName: string,
    suggestedGroup?: number | null
  ) => {
    const selectedGroup = selectedGroupByReportId[reportId] ?? suggestedGroup ?? 1;

    setBusyReportId(reportId);
    try {
      const memberPayload = {
        full_name: fullName.trim(),
        group_number: Number(selectedGroup),
        is_active: true,
        created_by: user?.id ?? null,
      };

      const clearFlagPayload = {
        report_id: reportId,
        is_duplicate: false,
        canonical_full_name: fullName.trim(),
        note: 'Agregado al padrón desde administración',
        updated_by: user?.id ?? null,
      };

      const [memberRes, flagRes] = await Promise.all([
        (supabase as any)
          .from('report_admin_custom_members')
          .upsert(memberPayload, { onConflict: 'full_name' }),
        (supabase as any)
          .from('report_admin_report_flags')
          .upsert(clearFlagPayload, { onConflict: 'report_id' }),
      ]);

      if (memberRes.error) throw memberRes.error;
      if (flagRes.error) throw flagRes.error;

      await fetchAdjustments();
      toast.success(`"${fullName}" agregado al padrón en Grupo ${selectedGroup}`);
    } catch (error) {
      console.error('Error adding member to roster:', error);
      toast.error('No se pudo agregar al padrón');
    } finally {
      setBusyReportId(null);
    }
  };

  const handleAddManualMember = async () => {
    const cleanName = manualMemberName.trim();
    if (!cleanName) {
      toast.error('Escribe el nombre de la persona.');
      return;
    }

    try {
      const payload = {
        full_name: cleanName,
        group_number: Number(manualMemberGroup),
        is_active: true,
        created_by: user?.id ?? null,
      };

      const { error } = await (supabase as any)
        .from('report_admin_custom_members')
        .upsert(payload, { onConflict: 'full_name' });

      if (error) throw error;
      setManualMemberName('');
      await fetchAdjustments();
      toast.success('Miembro agregado al padrón');
    } catch (error) {
      console.error('Error adding manual member:', error);
      toast.error('No se pudo agregar manualmente');
    }
  };

  const handleRemoveCustomMember = async (id: string, fullName: string) => {
    try {
      const { error } = await (supabase as any)
        .from('report_admin_custom_members')
        .update({ is_active: false, updated_by: user?.id ?? null })
        .eq('id', id);

      if (error) throw error;
      await fetchAdjustments();
      toast.success(`Se quitó del padrón: ${fullName}`);
    } catch (error) {
      console.error('Error removing custom member:', error);
      toast.error('No se pudo quitar del padrón');
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

  const rosterOptions = [...roster]
    .sort((a, b) => {
      if (a.groupNumber !== b.groupNumber) return a.groupNumber - b.groupNumber;
      return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
    });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AdminHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onClearDatabase={handleClearDatabase}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as AdminSection)}
          className="space-y-5"
        >
          <Card className="shadow-card">
            <CardContent className="p-3">
              <TabsList className="h-auto w-full flex flex-wrap justify-start gap-2 bg-muted/40">
                <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
                <TabsTrigger value="padron">Padrón</TabsTrigger>
                <TabsTrigger value="informes">Informes</TabsTrigger>
                <TabsTrigger value="superadmin">Super Admin</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="seguimiento">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle className="text-2xl">Seguimiento mensual de informes</CardTitle>
                    <CardDescription>
                      Periodo: <b>{targetMonth} {targetYear}</b> · Total esperado: <b>{totalExpected}</b> personas
                    </CardDescription>
                  </div>
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

                  <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <UserX className="h-4 w-4 text-warning" /> Faltan por enviar
                    </p>
                    <p className="text-3xl font-bold mt-1 text-amber-700 dark:text-amber-400">{missingCount}</p>
                  </div>

                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" /> Grupo erróneo
                    </p>
                    <p className="text-3xl font-bold mt-1 text-destructive">{wrongGroupMembers.length}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso de entrega</span>
                    <span className="font-semibold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                <p className="text-xs text-muted-foreground">
                  Conteo por nombre único en el periodo. Si hay correcciones de padrón o duplicados marcados,
                  también se consideran aquí.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asistencia">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Sección de asistencia</CardTitle>
                <CardDescription>
                  Registro de asistencia y visualización de estadísticas por reunión.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-1">
                    <AttendanceForm onSuccess={() => setAttendanceRefreshKey((prev) => prev + 1)} />
                  </div>
                  <div className="xl:col-span-2" key={attendanceRefreshKey}>
                    <AttendanceStats />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="padron">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Control de padrón (solo administración)
                </CardTitle>
                <CardDescription>
                  Puedes ver quién falta, detectar grupo erróneo y resolver no encontrados como
                  <b> otra persona</b>, <b>duplicado</b> o <b>agregar al padrón</b>.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Ajuste rápido de padrón
                  </p>
                  <div className="grid gap-2 md:grid-cols-[1fr,180px,auto]">
                    <Input
                      value={manualMemberName}
                      onChange={(e) => setManualMemberName(e.target.value)}
                      placeholder="Nombre completo (ej. Victor Gonzalez)"
                    />
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={manualMemberGroup}
                      onChange={(e) => setManualMemberGroup(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((group) => (
                        <option key={group} value={group}>
                          Grupo {group}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleAddManualMember}>Agregar al padrón</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Úsalo cuando la persona no exista en el padrón base.
                  </p>

                  {customMembers.length > 0 && (
                    <div className="mt-3 max-h-28 overflow-auto space-y-2 pr-1">
                      {customMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1.5">
                          <p className="text-xs">
                            {member.full_name} · <span className="text-muted-foreground">Grupo {member.group_number}</span>
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCustomMember(member.id, member.full_name)}
                          >
                            Quitar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="font-semibold">Faltan por enviar</h3>
                      <Badge variant="secondary">{missingCount}</Badge>
                    </div>

                    {missingCount === 0 ? (
                      <p className="text-sm text-muted-foreground">Excelente: no hay pendientes en el padrón.</p>
                    ) : (
                      <div className="max-h-72 overflow-auto pr-1 space-y-2">
                        {missingMembersDisplay.map(({ member }) => (
                          <div
                            key={`${member.groupNumber}-${member.fullName}`}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                          >
                            <p className="text-sm font-medium">{member.fullName}</p>
                            <Badge variant="outline">Grupo {member.groupNumber}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-destructive/30 p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="font-semibold">Posible grupo erróneo</h3>
                        <Badge variant="destructive">{wrongGroupMembers.length}</Badge>
                      </div>

                      {wrongGroupMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin diferencias detectadas contra el padrón.</p>
                      ) : (
                        <div className="max-h-40 overflow-auto pr-1 space-y-2">
                          {wrongGroupMembers.map(({ member, selectedGroup, report }) => (
                            <div
                              key={report?.id || `${member.groupNumber}-${member.fullName}`}
                              className="rounded-lg border border-destructive/30 px-3 py-2"
                            >
                              <p className="text-sm font-medium">{member.fullName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Padrón: <b>Grupo {member.groupNumber}</b> · Enviado en: <b>Grupo {selectedGroup}</b>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="font-semibold">No encontrados en padrón</h3>
                        <Badge variant="secondary">{unresolvedUnknownSubmitters.length}</Badge>
                      </div>

                      {unresolvedUnknownSubmitters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Todos los envíos quedaron resueltos contra el padrón.
                        </p>
                      ) : (
                        <div className="max-h-64 overflow-auto pr-1 space-y-2">
                          {unresolvedUnknownSubmitters.map((report) => {
                            const maybeMember = findCongregationMemberByName(report.fullName);
                            const defaultGroup = report.superintendentGroupNumber ?? 1;
                            const selectedGroup = selectedGroupByReportId[report.id] ?? defaultGroup;

                            return (
                              <div key={report.id} className="rounded-lg border border-border/60 px-3 py-2 space-y-2">
                                <div>
                                  <p className="text-sm font-medium">{report.fullName}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {maybeMember
                                      ? `Sugerencia: Grupo ${maybeMember.groupNumber}`
                                      : 'Revisar ortografía o resolver desde los botones.'}
                                  </p>
                                </div>

                                <div className="grid gap-2">
                                  <select
                                    className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                    value={selectedCanonicalByReportId[report.id] ?? ''}
                                    onChange={(e) =>
                                      setSelectedCanonicalByReportId((prev) => ({
                                        ...prev,
                                        [report.id]: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">Seleccionar persona correcta...</option>
                                    {rosterOptions.map((member) => (
                                      <option
                                        key={`${member.groupNumber}-${member.fullName}`}
                                        value={member.fullName}
                                      >
                                        {member.fullName} (Grupo {member.groupNumber})
                                      </option>
                                    ))}
                                  </select>

                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={busyReportId === report.id}
                                      onClick={() => handleMapAsOtherPerson(report.id, report.fullName)}
                                    >
                                      Es otra persona
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={busyReportId === report.id}
                                      onClick={() => handleMarkAsDuplicate(report.id)}
                                    >
                                      Marcar duplicado
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <select
                                      className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                      value={selectedGroup}
                                      onChange={(e) =>
                                        setSelectedGroupByReportId((prev) => ({
                                          ...prev,
                                          [report.id]: Number(e.target.value),
                                        }))
                                      }
                                    >
                                      {[1, 2, 3, 4, 5].map((group) => (
                                        <option key={group} value={group}>
                                          Grupo {group}
                                        </option>
                                      ))}
                                    </select>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={busyReportId === report.id}
                                      onClick={() =>
                                        handleAddUnknownToRoster(
                                          report.id,
                                          report.fullName,
                                          report.superintendentGroupNumber
                                        )
                                      }
                                    >
                                      Agregar al padrón
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="font-semibold">Duplicados marcados</h3>
                        <Badge variant="secondary">{duplicateMarkedReports.length}</Badge>
                      </div>

                      {duplicateMarkedReports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay duplicados marcados.</p>
                      ) : (
                        <div className="max-h-36 overflow-auto pr-1 space-y-2">
                          {duplicateMarkedReports.map((report) => (
                            <div key={report.id} className="rounded-lg border border-border/60 px-3 py-2 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium">{report.fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {report.month} {report.year}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyReportId === report.id}
                                onClick={() => handleUnmarkDuplicate(report.id)}
                              >
                                Quitar marca
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {adjustmentsLoading && (
                      <p className="text-xs text-muted-foreground">Actualizando ajustes de padrón…</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
