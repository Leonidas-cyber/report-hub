import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { SuccessModal } from '@/components/SuccessModal';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import {
  setCurrentUser,
  clearCurrentUser,
  shouldShowReminderForMonth,
  markCurrentSubscriptionAsReported,
} from '@/utils/pushNotifications';
import { 
  ROLES, 
  getPreviousMonth,
  getPreviousMonthYear,
} from '@/types/report';
import type { RoleType } from '@/types/report';
import { AlertTriangle, Send, Settings } from 'lucide-react';

const Index = () => {
  // Reports are always for the PREVIOUS month
  const reportMonth = getPreviousMonth();
  const reportYear = getPreviousMonthYear();
  const { superintendents, loading: loadingSuperintendents } = useSuperintendents();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RoleType | ''>('');
  const [hours, setHours] = useState('');
  const [bibleCourses, setBibleCourses] = useState('');
  const [participated, setParticipated] = useState<string>('');
  const [superintendentId, setSuperintendentId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReminder, setShowReminder] = useState(true);

  const showHoursField = role === 'precursor_auxiliar' || role === 'precursor_regular';

  useEffect(() => {
    let mounted = true;

    const localStorageKey = `report_submitted_${reportMonth}_${reportYear}`;
    const submittedLocally = localStorage.getItem(localStorageKey) === '1';

    if (submittedLocally) {
      setShowReminder(false);
    }

    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setCurrentUser(user?.email ?? null);

        const shouldShow = await shouldShowReminderForMonth(reportMonth, reportYear);
        if (mounted) {
          setShowReminder(!submittedLocally && shouldShow);
        }
      } catch (err) {
        console.warn('No se pudo validar estado de recordatorio:', err);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
      clearCurrentUser();
    };
  }, [reportMonth, reportYear]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      return;
    }

    if (!role) {
      return;
    }

    if (participated === '') {
      return;
    }

    if (!superintendentId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('service_reports').insert({
        full_name: fullName.trim(),
        role: role as RoleType,
        hours: hours ? parseInt(hours) : null,
        bible_courses: bibleCourses ? parseInt(bibleCourses) : null,
        participated: participated === 'yes',
        superintendent_id: superintendentId,
        notes: notes.trim(),
        month: reportMonth,
        year: reportYear,
      });

      if (error) throw error;

      await markCurrentSubscriptionAsReported(reportMonth, reportYear, fullName.trim());
      localStorage.setItem(`report_submitted_${reportMonth}_${reportYear}`, '1');
      setShowReminder(false);

      // Show success modal
      setShowSuccess(true);
      
      // Reset form
      setFullName('');
      setRole('');
      setHours('');
      setBibleCourses('');
      setParticipated('');
      setSuperintendentId('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="icon-circle-primary flex-shrink-0 overflow-hidden">
              <img
                src="/favicon-64.png?v=2"
                alt="Congregación Arrayanes"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
              />
            </div>
            <span className="font-bold text-sm sm:text-lg text-foreground truncate">
              Congregación Arrayanes
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <NotificationPrompt />
            <Link to="/about">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <span className="hidden sm:inline">Información</span>
                <span className="sm:hidden text-xs">Info</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Administración</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Informe de Servicio</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Por favor, complete el siguiente formulario con los detalles de su servicio del mes.
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-primary">
              Informe Mensual de Servicio
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              El informe corresponde al mes de: <strong className="text-primary text-lg">{reportMonth} {reportYear}</strong>
            </p>
          </CardHeader>

          <CardContent>
            {/* Recordatorio (solo si aún no ha enviado) */}
            {showReminder && (
              <div className="alert-reminder flex items-center gap-3 mb-6">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <strong>Recordatorio:</strong> Aún no has enviado tu informe correspondiente a {reportMonth}.
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mb-6">
              Complete todos los campos requeridos
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base">Nombre Completo:</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingrese su nombre completo"
                  className="input-field text-lg py-6"
                  required
                />
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label className="text-base">Rol:</Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleType)} required>
                  <SelectTrigger className="input-field text-lg py-6">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="text-lg py-3">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos condicionales para precursores */}
              {showHoursField && (
                <>
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="hours" className="text-base">Número de Horas:</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Ingrese el número de horas"
                      className="input-field text-lg py-6"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="bibleCourses" className="text-base">Número de Cursos Bíblicos:</Label>
                    <Input
                      id="bibleCourses"
                      type="number"
                      min="0"
                      value={bibleCourses}
                      onChange={(e) => setBibleCourses(e.target.value)}
                      placeholder="Ingrese el número de cursos bíblicos"
                      className="input-field text-lg py-6"
                    />
                  </div>
                </>
              )}

              {/* Participación */}
              <div className="space-y-3">
                <Label className="text-base">Participó en alguna faceta de la predicación durante el mes:</Label>
                <RadioGroup value={participated} onValueChange={setParticipated}>
                  <Label
                    htmlFor="participated-yes"
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${participated === 'yes' ? 'border-success bg-success/5' : 'border-border hover:border-success/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="yes" id="participated-yes" className="mt-1" />
                      <div>
                        <div className="font-medium text-success text-lg leading-tight">
                          Sí, participé
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Marque si realizó alguna actividad este mes
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="participated-no"
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${participated === 'no' ? 'border-destructive bg-destructive/5' : 'border-border hover:border-destructive/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="no" id="participated-no" className="mt-1" />
                      <div>
                        <div className="font-medium text-destructive text-lg leading-tight">
                          No participé
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Seleccione si no pudo realizar actividades
                        </p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {/* Capitán de servicio */}
              <div className="space-y-2">
                <Label className="text-base">Capitán de Servicio:</Label>
                <Select value={superintendentId} onValueChange={setSuperintendentId} disabled={loadingSuperintendents} required>
                  <SelectTrigger className="input-field text-lg py-6">
                    <SelectValue placeholder="Seleccione el capitán correspondiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {superintendents.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No hay capitanes cargados en base de datos
                      </div>
                    ) : (
                      superintendents.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-lg py-3">
                          {s.name} Grupo {s.group_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Notas:</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregue cualquier nota adicional (opcional)"
                  className="input-field min-h-[100px] resize-none text-lg"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="px-10 py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Informe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        open={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        month={reportMonth}
      />
    </div>
  );
};

export default Index;
