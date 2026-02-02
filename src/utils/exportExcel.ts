import * as XLSX from 'xlsx';
import { ServiceReport, getRoleLabel } from '@/types/report';

export function exportToExcel(reports: ServiceReport[], fileName: string = 'informes') {
  const data = reports.map((report) => ({
    'Nombre Completo': report.fullName,
    'Rol': getRoleLabel(report.role),
    'Horas': report.hours ?? 'N/A',
    'Cursos Bíblicos': report.bibleCourses ?? 'N/A',
    'Participó': report.participated ? 'Sí' : 'No',
    'Superintendente': report.superintendentName,
    'Mes': report.month,
    'Año': report.year,
    'Notas': report.notes || '',
    'Fecha de Envío': new Date(report.submittedAt).toLocaleDateString('es-ES'),
    'Estado': report.status === 'pending' ? 'Pendiente' : report.status === 'reviewed' ? 'Revisado' : 'Editado',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 25 }, // Nombre
    { wch: 18 }, // Rol
    { wch: 8 },  // Horas
    { wch: 15 }, // Cursos
    { wch: 10 }, // Participó
    { wch: 20 }, // Superintendente
    { wch: 12 }, // Mes
    { wch: 8 },  // Año
    { wch: 30 }, // Notas
    { wch: 15 }, // Fecha
    { wch: 12 }, // Estado
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Informes');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
}
