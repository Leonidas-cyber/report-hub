import { useState, useEffect } from 'react';
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
import { setupNotifications } from '@/utils/notifications';
import { 
  ROLES, 
  getPreviousMonth,
  getPreviousMonthYear,
} from '@/types/report';
import type { RoleType } from '@/types/report';
import { AlertTriangle, Send, Settings, FileText, Users } from 'lucide-react';

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

  const showHoursField = role === 'precursor_auxiliar' || role === 'precursor_regular';

  // Initialize notifications on mount
  useEffect(() => {
    setupNotifications();
  }, []);
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-circle-primary">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground">Congregación Arrayanes</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <NotificationPrompt />
            <Link to="/attendance">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Asistencia
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">
                Información
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Administración
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Informe de Servicio</h1>
          <p className="text-muted-foreground mt-1">
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
            {/* Recordatorio */}
            <div className="alert-reminder flex items-center gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div>
                <strong>Recordatorio:</strong> Aún no has enviado tu informe correspondiente a {reportMonth}.
              </div>
            </div>

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
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-success/50 transition-colors">
                    <RadioGroupItem value="yes" id="participated-yes" className="mt-1" />
                    <div>
                      <Label htmlFor="participated-yes" className="font-medium text-success cursor-pointer text-lg">
                        Sí, participé
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Marque si realizó alguna actividad este mes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-destructive/50 transition-colors">
                    <RadioGroupItem value="no" id="participated-no" className="mt-1" />
                    <div>
                      <Label htmlFor="participated-no" className="font-medium text-destructive cursor-pointer text-lg">
                        No participé
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Seleccione si no pudo realizar actividades
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Superintendente */}
              <div className="space-y-2">
                <Label className="text-base">Superintendente de Servicio:</Label>
                <Select value={superintendentId} onValueChange={setSuperintendentId} disabled={loadingSuperintendents} required>
                  <SelectTrigger className="input-field text-lg py-6">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {superintendents.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-lg py-3">
                        {s.name} Grupo {s.group_number}
                      </SelectItem>
                    ))}
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
