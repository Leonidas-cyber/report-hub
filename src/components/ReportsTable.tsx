import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceReport } from '@/hooks/useServiceReports';
import { 
  RoleType, 
  ROLES, 
  getRoleBadgeClass, 
  getRoleLabel 
} from '@/types/report';
import { Edit2, Check, X, Search, Filter } from 'lucide-react';

interface Superintendent {
  id: string;
  name: string;
  group_number: number;
}

interface ReportsTableProps {
  reports: ServiceReport[];
  superintendents: Superintendent[];
  onUpdateReport: (id: string, updates: Partial<ServiceReport>) => void;
}

export function ReportsTable({ reports, superintendents, onUpdateReport }: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterParticipated, setFilterParticipated] = useState<string>('all');
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceReport>>({});

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || report.role === filterRole;
    const matchesParticipated = 
      filterParticipated === 'all' || 
      (filterParticipated === 'yes' && report.participated) ||
      (filterParticipated === 'no' && !report.participated);
    
    return matchesSearch && matchesRole && matchesParticipated;
  });

  const handleEdit = (report: ServiceReport) => {
    setEditingReport(report);
    setEditForm({
      fullName: report.fullName,
      role: report.role,
      hours: report.hours,
      bibleCourses: report.bibleCourses,
      participated: report.participated,
      superintendentId: report.superintendentId,
      notes: report.notes,
    });
  };

  const handleSaveEdit = () => {
    if (editingReport) {
      onUpdateReport(editingReport.id, {
        ...editForm,
        status: 'edited',
      });
      setEditingReport(null);
    }
  };

  const getStatusBadge = (status: ServiceReport['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'reviewed':
        return <Badge className="bg-success text-success-foreground">Revisado</Badge>;
      case 'edited':
        return <Badge className="bg-info text-info-foreground">Editado</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterParticipated} onValueChange={setFilterParticipated}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Participación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Participó</SelectItem>
              <SelectItem value="no">No participó</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-center">Horas</TableHead>
              <TableHead className="text-center">Cursos</TableHead>
              <TableHead className="text-center">Participó</TableHead>
              <TableHead>Superintendente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron informes
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{report.fullName}</TableCell>
                  <TableCell>
                    <span className={`badge-role ${getRoleBadgeClass(report.role)}`}>
                      {getRoleLabel(report.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {report.hours ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {report.bibleCourses ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {report.participated ? (
                      <Check className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {report.superintendentName}
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(report)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredReports.length} de {reports.length} informes
      </div>

      {/* Modal de edición */}
      <Dialog open={!!editingReport} onOpenChange={() => setEditingReport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Informe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                value={editForm.fullName || ''}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v as RoleType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(editForm.role === 'precursor_auxiliar' || editForm.role === 'precursor_regular') && (
              <>
                <div className="space-y-2">
                  <Label>Horas</Label>
                  <Input
                    type="number"
                    value={editForm.hours || ''}
                    onChange={(e) => setEditForm({ ...editForm, hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cursos Bíblicos</Label>
                  <Input
                    type="number"
                    value={editForm.bibleCourses || ''}
                    onChange={(e) => setEditForm({ ...editForm, bibleCourses: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Superintendente</Label>
              <Select
                value={editForm.superintendentId}
                onValueChange={(v) => setEditForm({ ...editForm, superintendentId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {superintendents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} Grupo {s.group_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReport(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
