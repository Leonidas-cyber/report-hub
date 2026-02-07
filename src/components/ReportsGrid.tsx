import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ServiceReport } from '@/hooks/useServiceReports';
import { RoleType, ROLES } from '@/types/report';
import { ReportCard } from './ReportCard';
import { Search, Filter } from 'lucide-react';

interface Superintendent {
  id: string;
  name: string;
  group_number: number;
}

interface ReportsGridProps {
  reports: ServiceReport[];
  superintendents: Superintendent[];
  onUpdateReport: (id: string, updates: Partial<ServiceReport>) => void;
  onDeleteReport?: (id: string) => void;
}

export function ReportsGrid({ reports, superintendents, onUpdateReport, onDeleteReport }: ReportsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterParticipated, setFilterParticipated] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<ServiceReport | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceReport>>({});

  const availableGroups = [...new Set(superintendents.map((s) => s.group_number))].sort((a, b) => a - b);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || report.role === filterRole;
    const matchesParticipated = 
      filterParticipated === 'all' || 
      (filterParticipated === 'yes' && report.participated) ||
      (filterParticipated === 'no' && !report.participated);

    const groupNumber = superintendents.find((s) => s.id === report.superintendentId)?.group_number;
    const matchesGroup = filterGroup === 'all' || String(groupNumber) === filterGroup;

    return matchesSearch && matchesRole && matchesParticipated && matchesGroup;
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

  const handleDelete = (report: ServiceReport) => {
    setDeletingReport(report);
  };

  const confirmDelete = () => {
    if (deletingReport && onDeleteReport) {
      onDeleteReport(deletingReport.id);
      setDeletingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/70 bg-muted/30">
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
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {availableGroups.map((group) => (
                <SelectItem key={group} value={String(group)}>
                  Grupo {group}
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

      {/* Grid de tarjetas */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No se encontraron informes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 xl:gap-8">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onEdit={handleEdit}
              onDelete={onDeleteReport ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

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
              <Label>Participación</Label>
              <Select
                value={
                  editForm.participated === true
                    ? 'yes'
                    : editForm.participated === false
                      ? 'no'
                      : ''
                }
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    participated: value === 'yes',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sí participó</SelectItem>
                  <SelectItem value="no">No participó</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      {/* Diálogo de confirmación de borrado */}
      <AlertDialog open={!!deletingReport} onOpenChange={() => setDeletingReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este informe?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el informe de{' '}
              <strong>{deletingReport?.fullName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
