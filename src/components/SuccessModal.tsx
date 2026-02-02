import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  month: string;
}

export function SuccessModal({ open, onClose, month }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center p-8">
        <div className="flex flex-col items-center gap-6">
          {/* Large success icon */}
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>

          {/* Large success message */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">
              ¡Informe Enviado!
            </h2>
            <p className="text-xl text-muted-foreground">
              Tu informe de <strong className="text-primary">{month}</strong> ha sido enviado correctamente.
            </p>
          </div>

          {/* Thank you message */}
          <p className="text-lg text-muted-foreground">
            Gracias por enviar tu informe de servicio.
          </p>

          {/* Close button */}
          <Button 
            onClick={onClose} 
            size="lg" 
            className="text-lg px-8 py-6 mt-4"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
