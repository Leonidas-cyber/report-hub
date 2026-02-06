import { useMemo, useState } from 'react';
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
  const { reports, loading, updateReport, deleteReport } = useServiceReports();
  const { superintendents } = useSuperintendents();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const sortedSuperintendents = useMemo(() => {
    return [...superintendents].sort((a, b) => {
      if (a.group_number !== b.group_number) return a.group_number - b.group_number;
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }, [superintendents]);

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
      <AdminHeader />

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
