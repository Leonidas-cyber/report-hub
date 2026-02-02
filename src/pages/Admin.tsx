import { StatCard } from '@/components/StatCard';
import { ReportsGrid } from '@/components/ReportsGrid';
import { AdminHeader } from '@/components/AdminHeader';
import { exportToExcel } from '@/utils/exportExcel';
import { useServiceReports } from '@/hooks/useServiceReports';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { getPreviousMonth } from '@/types/report';
import { Users, FileText, Clock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

const Admin = () => {
  const { reports, loading, updateReport, deleteReport, refetch } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousMonth = getPreviousMonth();

  const totalReports = reports.length;
  const participatedCount = reports.filter(r => r.participated).length;
  const totalHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);
  const precursorCount = reports.filter(r => r.role !== 'publicador').length;

  const handleUpdateReport = async (id: string, updates: Parameters<typeof updateReport>[1]) => {
    try {
      await updateReport(id, updates);
      toast.success('Informe actualizado correctamente');
    } catch {
      toast.error('Error al actualizar el informe');
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      toast.success('Informe eliminado correctamente');
    } catch {
      toast.error('Error al eliminar el informe');
    }
  };

  const handleExportExcel = () => {
    if (reports.length === 0) {
      toast.error('No hay informes para exportar');
      return;
    }
    exportToExcel(reports, `informes_${previousMonth.toLowerCase()}_${new Date().getFullYear()}`);
    toast.success('Archivo Excel descargado correctamente');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Datos actualizados');
  };

  const handleClearDatabase = async () => {
    try {
      const { error } = await supabase
        .from('service_reports')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
      
      toast.success('Todos los informes han sido eliminados');
      await refetch();
    } catch {
      toast.error('Error al eliminar los informes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando informes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with welcome message and avatar */}
      <AdminHeader 
        onRefresh={handleRefresh}
        onExport={handleExportExcel}
        onClearDatabase={handleClearDatabase}
        isRefreshing={isRefreshing}
      />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Título del mes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">
            Informes de {previousMonth} {new Date().getFullYear()}
          </h2>
          <p className="text-muted-foreground mt-1">
            Datos actualizados en tiempo real
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Informes"
            value={totalReports}
            description="Informes recibidos este mes"
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Participaron"
            value={participatedCount}
            description={totalReports > 0 ? `${Math.round((participatedCount / totalReports) * 100)}% del total` : '0% del total'}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Horas Totales"
            value={totalHours}
            description="Horas de servicio reportadas"
            icon={Clock}
            variant="info"
          />
          <StatCard
            title="Precursores"
            value={precursorCount}
            description="Auxiliares y regulares"
            icon={Download}
            variant="warning"
          />
        </div>

        {/* Grid de tarjetas */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Listado de Informes
            </h3>
          </div>
          <ReportsGrid 
            reports={reports} 
            superintendents={superintendents}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
          />
        </div>
      </main>
    </div>
  );
};

export default Admin;
