import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceReport } from '@/hooks/useServiceReports';
import { getRoleBadgeClass, getRoleLabel, formatDate } from '@/types/report';
import { Edit2, Trash2, Clock, BookOpen, Users, FileText, Check, X } from 'lucide-react';

interface ReportCardProps {
  report: ServiceReport;
  onEdit: (report: ServiceReport) => void;
  onDelete?: (report: ServiceReport) => void;
}

export function ReportCard({ report, onEdit, onDelete }: ReportCardProps) {
  return (
    <Card className="card-elevated hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardContent className="pt-6 flex-1">
        {/* Header: Name and date */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-foreground leading-tight">
            {report.fullName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(report.submittedAt)}
          </p>
        </div>

        {/* Badges: Role and participation */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge-role ${getRoleBadgeClass(report.role)}`}>
            {getRoleLabel(report.role)}
          </span>
          {report.participated ? (
            <Badge className="bg-success/10 text-success border-success/20">
              <Check className="h-3 w-3 mr-1" />
              Participó
            </Badge>
          ) : (
            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
              <X className="h-3 w-3 mr-1" />
              No participó
            </Badge>
          )}
        </div>

        {/* Stats: Hours and courses */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Horas</p>
              <p className="font-semibold text-foreground">{report.hours ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Cursos</p>
              <p className="font-semibold text-foreground">{report.bibleCourses ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Superintendent */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Grupo</p>
            <p className="text-sm font-medium text-foreground">{report.superintendentName}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Notas</p>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {report.notes || 'Sin notas'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        <Button 
          className="flex-1"
          onClick={() => onEdit(report)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </Button>
        {onDelete && (
          <Button 
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(report)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Borrar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
