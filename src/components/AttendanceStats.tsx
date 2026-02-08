import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Calculator, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  date: string;
  meeting_type: string;
  attendees: number;
  month: string;
  year: number;
}

interface Stats {
  weekdayAvg: number;
  weekendAvg: number;
  totalMonthly: number;
  generalAvg: number;
}

export function AttendanceStats() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ weekdayAvg: 0, weekendAvg: 0, totalMonthly: 0, generalAvg: 0 });
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const months = [
    { value: 'enero', label: 'Enero' },
    { value: 'febrero', label: 'Febrero' },
    { value: 'marzo', label: 'Marzo' },
    { value: 'abril', label: 'Abril' },
    { value: 'mayo', label: 'Mayo' },
    { value: 'junio', label: 'Junio' },
    { value: 'julio', label: 'Julio' },
    { value: 'agosto', label: 'Agosto' },
    { value: 'septiembre', label: 'Septiembre' },
    { value: 'octubre', label: 'Octubre' },
    { value: 'noviembre', label: 'Noviembre' },
    { value: 'diciembre', label: 'Diciembre' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    const currentMonthIndex = new Date().getMonth();
    setSelectedMonth(months[currentMonthIndex].value);
  }, []);

  const calculateStats = useCallback((data: AttendanceRecord[]) => {
    const weekday = data.filter((r) => r.meeting_type === 'entre_semana');
    const weekend = data.filter((r) => r.meeting_type === 'fin_semana');

    const weekdaySum = weekday.reduce((sum, r) => sum + r.attendees, 0);
    const weekendSum = weekend.reduce((sum, r) => sum + r.attendees, 0);
    const total = weekdaySum + weekendSum;

    setStats({
      weekdayAvg: weekday.length > 0 ? Math.round(weekdaySum / weekday.length) : 0,
      weekendAvg: weekend.length > 0 ? Math.round(weekendSum / weekend.length) : 0,
      totalMonthly: total,
      generalAvg: data.length > 0 ? Math.round(total / data.length) : 0,
    });
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedMonth) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('month', selectedMonth)
      .eq('year', parseInt(selectedYear, 10))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching attendance:', error);
      toast.error('No se pudo cargar la asistencia');
      return;
    }

    setRecords(data || []);
    calculateStats(data || []);
  }, [selectedMonth, selectedYear, calculateStats]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const formatAttendanceLabel = (record: AttendanceRecord) => {
    const dateLabel = new Date(record.date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return `${record.meeting_type === 'entre_semana' ? 'Entre semana' : 'Fin de semana'} · ${dateLabel} · ${record.attendees} asistentes`;
  };

  const openDeleteDialog = (record: AttendanceRecord) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAttendance = async () => {
    if (!recordToDelete) return;

    setDeletingId(recordToDelete.id);
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('id', recordToDelete.id);

      if (error) throw error;

      toast.success('Registro de asistencia eliminado');
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      await fetchRecords();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('No se pudo eliminar el registro');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            Estadísticas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-muted-foreground">Mes:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-muted-foreground">Año:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => void fetchRecords()} className="w-full sm:w-auto">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Promedios
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Reuniones de Entre Semana</h4>
                <p className="text-3xl font-bold text-primary">{stats.weekdayAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">Promedio de asistentes</p>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <CardContent className="pt-6 text-center">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Reuniones de Fin de Semana</h4>
                <p className="text-3xl font-bold text-green-600">{stats.weekendAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">Promedio de asistentes</p>
              </CardContent>
            </Card>

            <Card className="border-info/20 bg-info/5">
              <CardContent className="pt-6 text-center">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Total Mensual</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.totalMonthly}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de asistentes</p>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-6 text-center">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Promedio General</h4>
                <p className="text-3xl font-bold text-amber-600">{stats.generalAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">Promedio de todas las reuniones</p>
              </CardContent>
            </Card>
          </div>

          {records.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Registros del Mes ({records.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Fecha</th>
                      <th className="text-left py-2 px-3">Tipo</th>
                      <th className="text-right py-2 px-3">Asistentes</th>
                      <th className="text-right py-2 px-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3">
                          {new Date(record.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          {record.meeting_type === 'entre_semana' ? 'Entre Semana' : 'Fin de Semana'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold">{record.attendees}</td>
                        <td className="py-2 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(record)}
                            disabled={deletingId === record.id}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar registro"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de asistencia?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Esta acción no se puede deshacer.</span>
              {recordToDelete && <span className="block font-medium text-foreground">{formatAttendanceLabel(recordToDelete)}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (deletingId) return;
                setRecordToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!deletingId) void confirmDeleteAttendance();
              }}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
