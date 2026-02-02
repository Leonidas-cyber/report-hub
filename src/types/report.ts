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
