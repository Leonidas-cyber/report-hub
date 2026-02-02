import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export function StatCard({ title, value, description, icon: Icon, variant = 'primary' }: StatCardProps) {
  const iconBgClass = {
    primary: 'icon-circle-primary',
    success: 'icon-circle-success',
    warning: 'icon-circle-warning',
    info: 'icon-circle-primary',
  }[variant];

  return (
    <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={iconBgClass}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
