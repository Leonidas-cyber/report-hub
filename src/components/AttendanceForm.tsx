import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Users } from 'lucide-react';

interface AttendanceFormProps {
  onSuccess?: () => void;
}

export function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState<string>('');
  const [attendees, setAttendees] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getMonthFromDate = (dateStr: string): { month: string; year: number } => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const d = new Date(dateStr);
    return {
      month: months[d.getMonth()],
      year: d.getFullYear()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingType || !attendees) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    try {
      const { month, year } = getMonthFromDate(date);
      
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          date,
          meeting_type: meetingType,
          attendees: parseInt(attendees, 10),
          month,
          year
        });

      if (error) throw error;

      toast.success('¡Asistencia registrada correctamente!');
      setAttendees('');
      setMeetingType('');
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar la asistencia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          Registro de Asistencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingType">Tipo de Reunión</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entre_semana">Reunión de Entre Semana (Jueves)</SelectItem>
                <SelectItem value="fin_semana">Reunión de Fin de Semana (Domingo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Número de Asistentes</Label>
            <Input
              id="attendees"
              type="number"
              min="0"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting}
          >
            <Users className="h-4 w-4 mr-2" />
            {submitting ? 'Registrando...' : 'Registrar Asistencia'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
