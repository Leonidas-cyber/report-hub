import { useState } from 'react';
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
import { toast } from 'sonner';
import { 
  RoleType, 
  ROLES, 
  SUPERINTENDENTS, 
  getCurrentMonth,
  ServiceReport 
} from '@/types/report';
import { AlertTriangle, Send } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (report: Omit<ServiceReport, 'id' | 'submittedAt' | 'status'>) => void;
}

export function ReportForm({ onSubmit }: ReportFormProps) {
  const currentMonth = getCurrentMonth();
  const currentYear = new Date().getFullYear();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RoleType | ''>('');
  const [hours, setHours] = useState('');
  const [bibleCourses, setBibleCourses] = useState('');
  const [participated, setParticipated] = useState<string>('');
  const [superintendentId, setSuperintendentId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showHoursField = role === 'precursor_auxiliar' || role === 'precursor_regular';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Por favor ingrese su nombre completo');
      return;
    }

    if (!role) {
      toast.error('Por favor seleccione su rol');
      return;
    }

    if (participated === '') {
      toast.error('Por favor indique si participó en la predicación');
      return;
    }

    if (!superintendentId) {
      toast.error('Por favor seleccione su superintendente de servicio');
      return;
    }

    setIsSubmitting(true);

    const superintendent = SUPERINTENDENTS.find(s => s.id === superintendentId);

    const report: Omit<ServiceReport, 'id' | 'submittedAt' | 'status'> = {
      fullName: fullName.trim(),
      role: role as RoleType,
      hours: hours ? parseInt(hours) : undefined,
      bibleCourses: bibleCourses ? parseInt(bibleCourses) : undefined,
      participated: participated === 'yes',
      superintendentId,
      superintendentName: superintendent ? `${superintendent.name} Grupo ${superintendent.group}` : '',
      notes: notes.trim(),
      month: currentMonth,
      year: currentYear,
    };

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSubmit(report);
    toast.success('¡Informe enviado correctamente!');
    
    // Reset form
    setFullName('');
    setRole('');
    setHours('');
    setBibleCourses('');
    setParticipated('');
    setSuperintendentId('');
    setNotes('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
              El mes de servicio que se enviará corresponde a: <strong>{currentMonth}</strong>
            </p>
          </CardHeader>

          <CardContent>
            {/* Recordatorio */}
            <div className="alert-reminder flex items-center gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div>
                <strong>Recordatorio:</strong> Aún no has enviado tu informe correspondiente a {currentMonth}.
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-6">
              Complete todos los campos requeridos
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo:</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingrese su nombre completo"
                  className="input-field"
                />
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label>Rol:</Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleType)}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
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
                    <Label htmlFor="hours">Número de Horas:</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Ingrese el número de horas"
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="bibleCourses">Número de Cursos Bíblicos:</Label>
                    <Input
                      id="bibleCourses"
                      type="number"
                      min="0"
                      value={bibleCourses}
                      onChange={(e) => setBibleCourses(e.target.value)}
                      placeholder="Ingrese el número de cursos bíblicos"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {/* Participación */}
              <div className="space-y-3">
                <Label>Participó en alguna faceta de la predicación durante el mes:</Label>
                <RadioGroup value={participated} onValueChange={setParticipated}>
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-success/50 transition-colors">
                    <RadioGroupItem value="yes" id="participated-yes" className="mt-1" />
                    <div>
                      <Label htmlFor="participated-yes" className="font-medium text-success cursor-pointer">
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
                      <Label htmlFor="participated-no" className="font-medium text-destructive cursor-pointer">
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
                <Label>Superintendente de Servicio:</Label>
                <Select value={superintendentId} onValueChange={setSuperintendentId}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPERINTENDENTS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} Grupo {s.group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas:</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregue cualquier nota adicional (opcional)"
                  className="input-field min-h-[100px] resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Informe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportForm;
