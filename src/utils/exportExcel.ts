import * as XLSX from 'xlsx';
import { ServiceReport } from '@/hooks/useServiceReports';
import { getRoleLabel } from '@/types/report';

export function exportToExcel(reports: ServiceReport[], fileName: string = 'informes_arrayanes') {
  // Order: nombre, rol, participo, horas, cursosBiblicos, superintendente, notas
  const data = reports.map((report) => ({
    'nombre': report.fullName,
    'rol': getRoleLabel(report.role),
    'participo': report.participated ? 'Sí' : 'No',
    'horas': report.hours ?? '',
    'cursosBiblicos': report.bibleCourses ?? '',
    'superintendente': report.superintendentName,
    'notas': report.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 30 }, // nombre
    { wch: 18 }, // rol
    { wch: 12 }, // participo
    { wch: 10 }, // horas
    { wch: 15 }, // cursosBiblicos
    { wch: 25 }, // superintendente
    { wch: 35 }, // notas
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Informes Arrayanes');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
}
