import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { ReportsTable } from '@/components/ReportsTable';
import { exportToExcel } from '@/utils/exportExcel';
import { useServiceReports } from '@/hooks/useServiceReports';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMonth } from '@/types/report';
import { 
  Users, 
  FileText, 
  Clock, 
  Download, 
  FileSpreadsheet,
  ArrowLeft,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Admin = () => {
  const { reports, loading, updateReport, refetch } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const { signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentMonth = getCurrentMonth();

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

  const handleExportExcel = () => {
    if (reports.length === 0) {
      toast.error('No hay informes para exportar');
      return;
    }
    exportToExcel(reports, `informes_${currentMonth.toLowerCase()}_${new Date().getFullYear()}`);
    toast.success('Archivo Excel descargado correctamente');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Datos actualizados');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">
                Gestión y control de informes de la congregación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              className="btn-excel"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Título del mes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">
            Informes de {currentMonth} {new Date().getFullYear()}
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

        {/* Tabla */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Listado de Informes
            </h3>
            <p className="text-sm text-muted-foreground">
              Haz clic en el ícono de editar para modificar un informe
            </p>
          </div>
          <ReportsTable 
            reports={reports} 
            superintendents={superintendents}
            onUpdateReport={handleUpdateReport}
          />
        </div>
      </main>
    </div>
  );
};

export default Admin;
