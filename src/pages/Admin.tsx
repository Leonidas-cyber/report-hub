import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel } from '@/utils/exportExcel';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportsTable } from '@/components/ReportsTable';
import { ReportsGrid } from '@/components/ReportsGrid';
import { AdminHeader } from '@/components/AdminHeader';
import { SuperAdminPanel } from '@/components/SuperAdminPanel';
import { useServiceReports } from '@/hooks/useServiceReports';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { useAuth } from '@/contexts/AuthContext';
import { Table2, LayoutGrid, ShieldCheck } from 'lucide-react';

const Admin = () => {
  const { user, isSuperAdmin } = useAuth();
  const { reports, loading, updateReport, deleteReport, refetch } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sortedSuperintendents = useMemo(() => {
    return [...superintendents].sort((a, b) => {
      if (a.group_number !== b.group_number) return a.group_number - b.group_number;
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }, [superintendents]);


  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.race([
        Promise.resolve(refetch()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
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

      <main className="container mx-auto px-4 py-8 space-y-6">
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
      </main>
    </div>
  );
};

export default Admin;
