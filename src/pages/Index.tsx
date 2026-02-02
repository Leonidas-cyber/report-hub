import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportForm } from '@/components/ReportForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceReport } from '@/types/report';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileSpreadsheet,
  FileText,
  Settings
} from 'lucide-react';

const Index = () => {
  const [submittedReports, setSubmittedReports] = useState<ServiceReport[]>([]);

  const handleSubmit = (reportData: Omit<ServiceReport, 'id' | 'submittedAt' | 'status'>) => {
    const newReport: ServiceReport = {
      ...reportData,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setSubmittedReports(prev => [...prev, newReport]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-circle-primary">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground">Informes de Servicio</span>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Administración
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario - 2 columnas */}
          <div className="lg:col-span-2">
            <ReportForm onSubmit={handleSubmit} />
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Card: Informes en Tiempo Real */}
            <Card className="card-elevated animate-slide-up">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="icon-circle-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Informes en Tiempo Real
                    </h3>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Visualiza los datos más recientes de la congregación actualizados en tiempo real.
                  </p>
                  <Link to="/admin">
                    <Button className="w-full">
                      Informes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card: Descargar Informes */}
            <Card className="card-elevated animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="icon-circle-success">
                    <Download className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Descargar Informes
                    </h3>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Genera y descarga informes en diferentes formatos para su análisis y archivo.
                  </p>
                  <div className="flex gap-2">
                    <Button className="btn-pdf flex-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    <Link to="/admin" className="flex-1">
                      <Button className="btn-excel w-full">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Control de Asistencia */}
            <Card className="card-elevated animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="icon-circle-warning">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Control de Asistencia
                    </h3>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Registro y consulta de asistencia para todas las reuniones (semanales y de fin de semana).
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Próximamente
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            {submittedReports.length > 0 && (
              <Card className="card-elevated bg-primary/5 border-primary/20 animate-fade-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary mb-2">
                    Tu actividad
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Has enviado <strong className="text-primary">{submittedReports.length}</strong> informe(s) en esta sesión.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
