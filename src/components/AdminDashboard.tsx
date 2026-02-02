import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { ReportsTable } from '@/components/ReportsTable';
import { exportToExcel } from '@/utils/exportExcel';
import { ServiceReport, getCurrentMonth } from '@/types/report';
import { 
  Users, 
  FileText, 
  Clock, 
  Download, 
  FileSpreadsheet,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data para demostración
const MOCK_REPORTS: ServiceReport[] = [
  {
    id: '1',
    fullName: 'María García López',
    role: 'precursor_regular',
    hours: 70,
    bibleCourses: 3,
    participated: true,
    superintendentId: '1',
    superintendentName: 'Alberto G. Grupo 1',
    notes: '',
    month: 'Enero',
    year: 2026,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '2',
    fullName: 'Juan Pérez Martínez',
    role: 'publicador',
    participated: true,
    superintendentId: '2',
    superintendentName: 'David N. Grupo 2',
    notes: 'Participé en la campaña especial',
    month: 'Enero',
    year: 2026,
    submittedAt: new Date().toISOString(),
    status: 'reviewed',
  },
  {
    id: '3',
    fullName: 'Ana Rodríguez Silva',
    role: 'precursor_auxiliar',
    hours: 50,
    bibleCourses: 2,
    participated: true,
    superintendentId: '3',
    superintendentName: 'Abraham G. Grupo 3',
    notes: '',
    month: 'Enero',
    year: 2026,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '4',
    fullName: 'Carlos Hernández Ruiz',
    role: 'publicador',
    participated: false,
    superintendentId: '4',
    superintendentName: 'Rogelio T. Grupo 4',
    notes: 'Problemas de salud este mes',
    month: 'Enero',
    year: 2026,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '5',
    fullName: 'Laura Sánchez Moreno',
    role: 'precursor_regular',
    hours: 85,
    bibleCourses: 5,
    participated: true,
    superintendentId: '5',
    superintendentName: 'Rafael G. Grupo 5',
    notes: 'Excelente mes de servicio',
    month: 'Enero',
    year: 2026,
    submittedAt: new Date().toISOString(),
    status: 'reviewed',
  },
];

export function AdminDashboard() {
  const [reports, setReports] = useState<ServiceReport[]>(MOCK_REPORTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentMonth = getCurrentMonth();

  const totalReports = reports.length;
  const participatedCount = reports.filter(r => r.participated).length;
  const totalHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);
  const precursorCount = reports.filter(r => r.role !== 'publicador').length;

  const handleUpdateReport = (id: string, updates: Partial<ServiceReport>) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, ...updates } : report
      )
    );
  };

  const handleExportExcel = () => {
    exportToExcel(reports, `informes_${currentMonth.toLowerCase()}_2026`);
    toast.success('Archivo Excel descargado correctamente');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular actualización
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Datos actualizados');
  };

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
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Título del mes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">
            Informes de {currentMonth} 2026
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
            description={`${Math.round((participatedCount / totalReports) * 100)}% del total`}
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
            onUpdateReport={handleUpdateReport}
          />
        </div>
      </main>
    </div>
  );
}
