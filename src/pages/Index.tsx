import { useEffect, useMemo, useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSuperintendents } from '@/hooks/useSuperintendents';
import { SuccessModal } from '@/components/SuccessModal';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { NotificationOnboarding } from '@/components/NotificationOnboarding';
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
import { AlertTriangle, Send, Settings, Accessibility, CheckCircle2 } from 'lucide-react';

const EASY_MODE_KEY = 'report_hub_easy_mode';

type ReportDraft = {
  fullName: string;
  role: RoleType | '';
  hours: string;
  bibleCourses: string;
  participated: string;
  superintendentId: string;
  notes: string;
};

const Index = () => {
  // Reports are always for the PREVIOUS month
  const reportMonth = getPreviousMonth();
  const reportYear = getPreviousMonthYear();
  const draftKey = `report_draft_${reportMonth}_${reportYear}`;

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
  const [easyMode, setEasyMode] = useState<boolean>(() => localStorage.getItem(EASY_MODE_KEY) === '1');
  const [draftReady, setDraftReady] = useState(false);

  const showHoursField = role === 'precursor_auxiliar' || role === 'precursor_regular';

  const requiredTotal = 4;
  const completedRequired = useMemo(() => {
    let completed = 0;
    if (fullName.trim()) completed += 1;
    if (role) completed += 1;
    if (participated !== '') completed += 1;
    if (superintendentId) completed += 1;
    return completed;
  }, [fullName, role, participated, superintendentId]);

  const formProgress = Math.round((completedRequired / requiredTotal) * 100);

  const step1Done = Boolean(fullName.trim() && role);
  const step2Done = Boolean(participated !== '' && superintendentId);
  const step3Ready = step1Done && step2Done;

  useEffect(() => {
    document.body.classList.toggle('easy-mode', easyMode);
    localStorage.setItem(EASY_MODE_KEY, easyMode ? '1' : '0');
  }, [easyMode]);

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

  // Cargar borrador guardado del mes actual
  useEffect(() => {
    const raw = localStorage.getItem(draftKey);

    if (!raw) {
      setDraftReady(true);
      return;
    }

    try {
      const draft = JSON.parse(raw) as Partial<ReportDraft>;
      if (typeof draft.fullName === 'string') setFullName(draft.fullName);
      if (typeof draft.role === 'string') {
        const isValidRole = ROLES.some((r) => r.value === draft.role);
        setRole(isValidRole ? (draft.role as RoleType) : '');
      }
      if (typeof draft.hours === 'string') setHours(draft.hours);
      if (typeof draft.bibleCourses === 'string') setBibleCourses(draft.bibleCourses);
      if (typeof draft.participated === 'string') setParticipated(draft.participated);
      if (typeof draft.superintendentId === 'string') setSuperintendentId(draft.superintendentId);
      if (typeof draft.notes === 'string') setNotes(draft.notes);
    } catch (error) {
      console.warn('No se pudo cargar borrador local:', error);
      localStorage.removeItem(draftKey);
    } finally {
      setDraftReady(true);
    }
  }, [draftKey]);

  // Guardado automático del borrador
  useEffect(() => {
    if (!draftReady) return;

    const hasAnyValue = [
      fullName,
      role,
      hours,
      bibleCourses,
      participated,
      superintendentId,
      notes,
    ].some((v) => `${v ?? ''}`.trim() !== '');

    if (!hasAnyValue) {
      localStorage.removeItem(draftKey);
      return;
    }

    const draft: ReportDraft = {
      fullName,
      role,
      hours,
      bibleCourses,
      participated,
      superintendentId,
      notes,
    };

    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [
    draftReady,
    draftKey,
    fullName,
    role,
    hours,
    bibleCourses,
    participated,
    superintendentId,
    notes,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;
    if (!role) return;
    if (participated === '') return;
    if (!superintendentId) return;

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
      localStorage.removeItem(draftKey);
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

  const labelClass = easyMode ? 'text-lg' : 'text-base';
  const inputClass = easyMode ? 'input-field text-xl py-7' : 'input-field text-lg py-6';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-background border border-border/70 shadow-sm flex-shrink-0 overflow-hidden">
              <img
                src="/favicon-64.png?v=3"
                alt="Congregación Arrayanes"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
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
        <div className="mb-4 rounded-xl border border-border bg-card p-3 sm:p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-primary" />
              Modo fácil
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Aumenta el tamaño de texto y controles para una lectura más cómoda.
            </p>
          </div>
          <Button
            type="button"
            variant={easyMode ? 'default' : 'outline'}
            onClick={() => setEasyMode((prev) => !prev)}
            className="min-w-[110px]"
          >
            {easyMode ? 'Activado' : 'Activar'}
          </Button>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className={easyMode ? 'text-2xl sm:text-3xl font-bold text-foreground' : 'text-xl sm:text-2xl font-bold text-foreground'}>
            Informe de Servicio
          </h1>
          <p className={easyMode ? 'text-base sm:text-lg text-muted-foreground mt-1' : 'text-sm sm:text-base text-muted-foreground mt-1'}>
            Por favor, complete el siguiente formulario con los detalles de su servicio del mes.
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className={easyMode ? 'text-2xl text-primary' : 'text-xl text-primary'}>
              Informe Mensual de Servicio
            </CardTitle>
            <p className={easyMode ? 'text-base text-muted-foreground' : 'text-sm text-muted-foreground'}>
              El informe corresponde al mes de:{' '}
              <strong className={easyMode ? 'text-primary text-xl' : 'text-primary text-lg'}>
                {reportMonth} {reportYear}
              </strong>
            </p>
          </CardHeader>

          <CardContent>
            {/* Recordatorio (solo si aún no ha enviado) */}
            {showReminder && (
              <div className="alert-reminder flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <strong>Recordatorio:</strong> Aún no has enviado tu informe correspondiente a {reportMonth}.
                </div>
              </div>
            )}

            {/* PROGRESO */}
            <div className="mb-5 rounded-xl border border-border/70 bg-muted/30 p-4">
              {/* Móvil / pantallas muy pequeñas: solo porcentaje */}
              <div className="sm:hidden">
                <div className="flex flex-col items-center justify-center py-1" aria-live="polite">
                  <p className="text-xs text-muted-foreground">Progreso del formulario</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-primary">
                    {formProgress}%
                  </p>
                  <p className="text-xs text-muted-foreground">completado</p>
                </div>
              </div>

              {/* Tablet / escritorio: progreso completo */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">Progreso del formulario</p>
                  <p className="text-sm font-semibold text-primary">{formProgress}%</p>
                </div>

                <Progress value={formProgress} className="mt-2 h-3" />

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div
                    className={`rounded-md border px-3 py-2 text-sm ${
                      step1Done ? 'border-success/50 bg-success/10' : 'border-border bg-background/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${step1Done ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Paso 1</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Datos básicos</p>
                  </div>

                  <div
                    className={`rounded-md border px-3 py-2 text-sm ${
                      step2Done ? 'border-success/50 bg-success/10' : 'border-border bg-background/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${step2Done ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Paso 2</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Participación y capitán</p>
                  </div>

                  <div
                    className={`rounded-md border px-3 py-2 text-sm ${
                      step3Ready ? 'border-success/50 bg-success/10' : 'border-border bg-background/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${step3Ready ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Paso 3</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Revisar y enviar</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-6">
              Guardado automático activado. Si cierras la página, tu borrador se conserva.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className={labelClass}>Nombre Completo:</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingrese su nombre completo"
                  className={inputClass}
                  required
                />
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label className={labelClass}>Rol:</Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleType)} required>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className={easyMode ? 'text-xl py-3' : 'text-lg py-3'}>
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
                    <Label htmlFor="hours" className={labelClass}>Número de Horas:</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Ingrese el número de horas"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="bibleCourses" className={labelClass}>Número de Cursos Bíblicos:</Label>
                    <Input
                      id="bibleCourses"
                      type="number"
                      min="0"
                      value={bibleCourses}
                      onChange={(e) => setBibleCourses(e.target.value)}
                      placeholder="Ingrese el número de cursos bíblicos"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Participación */}
              <div className="space-y-3">
                <Label className={labelClass}>Participó en alguna faceta de la predicación durante el mes:</Label>
                <RadioGroup value={participated} onValueChange={setParticipated}>
                  <Label
                    htmlFor="participated-yes"
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                      participated === 'yes' ? 'border-success bg-success/5' : 'border-border hover:border-success/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="yes" id="participated-yes" className="mt-1" />
                      <div>
                        <div className={easyMode ? 'font-medium text-success text-xl leading-tight' : 'font-medium text-success text-lg leading-tight'}>
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
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                      participated === 'no' ? 'border-destructive bg-destructive/5' : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="no" id="participated-no" className="mt-1" />
                      <div>
                        <div className={easyMode ? 'font-medium text-destructive text-xl leading-tight' : 'font-medium text-destructive text-lg leading-tight'}>
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
                <Label className={labelClass}>Capitán de Servicio:</Label>
                <Select value={superintendentId} onValueChange={setSuperintendentId} disabled={loadingSuperintendents} required>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Seleccione el capitán correspondiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {superintendents.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No hay capitanes cargados en base de datos
                      </div>
                    ) : (
                      superintendents.map((s) => (
                        <SelectItem key={s.id} value={s.id} className={easyMode ? 'text-xl py-3' : 'text-lg py-3'}>
                          {s.name} Grupo {s.group_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className={labelClass}>Notas:</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregue cualquier nota adicional (opcional)"
                  className={easyMode ? 'input-field min-h-[120px] resize-none text-xl' : 'input-field min-h-[100px] resize-none text-lg'}
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className={easyMode ? 'px-10 py-7 text-xl' : 'px-10 py-6 text-lg'}
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

      <NotificationOnboarding />
    </div>
  );
};

export default Index;
