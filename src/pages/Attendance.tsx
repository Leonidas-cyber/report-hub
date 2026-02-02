import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AttendanceForm } from '@/components/AttendanceForm';
import { AttendanceStats } from '@/components/AttendanceStats';
import { ArrowLeft, Users } from 'lucide-react';
import { useState } from 'react';

const Attendance = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Control de Asistencia
                </h1>
                <p className="text-sm text-muted-foreground">
                  Congregación Arrayanes
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <AttendanceForm onSuccess={handleSuccess} />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Registra la asistencia al finalizar cada reunión.<br />
              Jueves (Entre Semana) y Domingos (Fin de Semana).
            </p>
          </div>
          <div className="lg:col-span-1">
            <AttendanceStats key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
