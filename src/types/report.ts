export type RoleType = 'publicador' | 'precursor_auxiliar' | 'precursor_regular';

export interface Superintendent {
  id: string;
  name: string;
  group: number;
}

export interface ServiceReport {
  id: string;
  fullName: string;
  role: RoleType;
  hours?: number;
  bibleCourses?: number;
  participated: boolean;
  superintendentId: string;
  superintendentName: string;
  notes: string;
  month: string;
  year: number;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'edited';
}

export const ROLES: { value: RoleType; label: string }[] = [
  { value: 'publicador', label: 'Publicador' },
  { value: 'precursor_auxiliar', label: 'Precursor Auxiliar' },
  { value: 'precursor_regular', label: 'Precursor Regular' },
];

export const SUPERINTENDENTS: Superintendent[] = [
  { id: '1', name: 'Alberto G.', group: 1 },
  { id: '2', name: 'David N.', group: 2 },
  { id: '3', name: 'Abraham G.', group: 3 },
  { id: '4', name: 'Rogelio T.', group: 4 },
  { id: '5', name: 'Rafael G.', group: 5 },
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Returns the PREVIOUS month name (reports are always for last month)
 */
export function getPreviousMonth(): string {
  const currentMonth = new Date().getMonth();
  // If January (0), return December (11)
  const previousMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  return MONTHS[previousMonthIndex];
}

/**
 * Returns the year for the previous month's report
 */
export function getPreviousMonthYear(): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  // If January, the previous month (December) belongs to last year
  return currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
}

/**
 * @deprecated Use getPreviousMonth() instead - reports should always be for the previous month
 */
export function getCurrentMonth(): string {
  return MONTHS[new Date().getMonth()];
}

export function getRoleBadgeClass(role: RoleType): string {
  switch (role) {
    case 'publicador':
      return 'badge-publicador';
    case 'precursor_auxiliar':
      return 'badge-precursor-auxiliar';
    case 'precursor_regular':
      return 'badge-precursor-regular';
    default:
      return '';
  }
}

export function getRoleLabel(role: RoleType): string {
  return ROLES.find(r => r.value === role)?.label || role;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
