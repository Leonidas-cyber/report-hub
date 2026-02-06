import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ReportForm from '@/components/ReportForm';
import NotificationPrompt from '@/components/NotificationPrompt';
import { ReportData, getPreviousMonth, getPreviousMonthYear } from '@/types/report';
import { supabase } from '@/integrations/supabase/client';
import { markCurrentSubscriptionAsReported } from '@/utils/pushNotifications';

const LAST_SUBMISSION_KEY = 'last_report_submission';

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const Index = () => {
  const [formData, setFormData] = useState<ReportData>({
    fullName: '',
    role: '',
    serviceHours: '',
    courses: '',
    participated: '',
    superintendent: '',
    comments: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [hasSubmittedCurrentPeriod, setHasSubmittedCurrentPeriod] = useState(false);

  // Get previous month for the report period
  const reportMonth = getPreviousMonth();
  const reportYear = getPreviousMonthYear();

  useEffect(() => {
    const savedRaw = localStorage.getItem(LAST_SUBMISSION_KEY);
    if (!savedRaw) {
      setHasSubmittedCurrentPeriod(false);
      return;
    }

    try {
      const saved = JSON.parse(savedRaw) as { fullName: string; month: string; year: number };
      const samePeriod = saved.month === reportMonth && Number(saved.year) === Number(reportYear);
      const sameName = normalizeName(saved.fullName || '') === normalizeName(formData.fullName || '');
      setHasSubmittedCurrentPeriod(Boolean(formData.fullName.trim()) && samePeriod && sameName);
    } catch {
      setHasSubmittedCurrentPeriod(false);
    }
  }, [formData.fullName, reportMonth, reportYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.role || formData.participated === '') {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    // Conditional validation based on participated status
    if (formData.participated === 'yes') {
      if (!formData.serviceHours || !formData.courses || !formData.superintendent) {
        toast.error('Si participaste, debes completar horas, cursos y superintendente');
        return;
      }
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('service_reports')
        .insert([
          {
            full_name: formData.fullName,
            role: formData.role,
            service_hours: formData.participated === 'yes' ? parseInt(formData.serviceHours) : null,
            courses: formData.participated === 'yes' ? parseInt(formData.courses) : null,
            participated: formData.participated === 'yes',
            superintendent: formData.participated === 'yes' ? formData.superintendent : null,
            comments: formData.comments || null,
            month: reportMonth,
            year: reportYear,
            status: 'pending'
          }
        ]);

      if (error) {
        throw error;
      }

      const cleanName = formData.fullName.trim();

      // Guardar envío local para ocultar el recordatorio del mismo periodo
      localStorage.setItem(
        LAST_SUBMISSION_KEY,
        JSON.stringify({ fullName: cleanName, month: reportMonth, year: reportYear })
      );
      setHasSubmittedCurrentPeriod(true);

      // Si el usuario activó notificaciones en este dispositivo,
      // marcar como "ya envió" para este mes y evitar recordatorios duplicados.
      await markCurrentSubscriptionAsReported({
        fullName: cleanName,
        month: reportMonth,
        year: reportYear,
      });

      toast.success('Informe enviado correctamente!');

      // Reset form
      setFormData({
        fullName: '',
        role: '',
        serviceHours: '',
        courses: '',
        participated: '',
        superintendent: '',
        comments: ''
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error al enviar el informe. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear conditional fields when participation status changes to "no"
      if (field === 'participated' && value === 'no') {
        newData.serviceHours = '';
        newData.courses = '';
        newData.superintendent = '';
      }

      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Informe Mensual de Servicio
            </CardTitle>
            <CardDescription className="text-lg">
              El informe corresponde al mes de: <span className="font-semibold text-primary">{reportMonth} {reportYear}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Recordatorio */}
            {!hasSubmittedCurrentPeriod && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  <strong>Recordatorio:</strong> Aún no has enviado tu informe correspondiente a {reportMonth}.
                </p>
              </div>
            )}

            {/* Notification Prompt */}
            <NotificationPrompt />

            {/* Report Form */}
            <ReportForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
