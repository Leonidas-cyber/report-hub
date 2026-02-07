export interface CongregationMember {
  fullName: string;
  groupNumber: number;
}

// Ajusta este número si cambia el padrón general.
export const TOTAL_EXPECTED_REPORTERS = 96;

// Padrón de referencia (uso administrativo interno)
const CONGREGATION_ROSTER: CongregationMember[] = [
  // Grupo 1
  { fullName: 'Alberto Gonzalez', groupNumber: 1 },
  { fullName: 'Valentin Callejas', groupNumber: 1 },
  { fullName: 'Esperanza de Callejas', groupNumber: 1 },
  { fullName: 'Claudia Cornejo', groupNumber: 1 },
  { fullName: 'Dinora Cornejo', groupNumber: 1 },
  { fullName: 'Estela Ortega', groupNumber: 1 },
  { fullName: 'Griselda de Vazquez', groupNumber: 1 },
  { fullName: 'Leonardo Gonzalez', groupNumber: 1 },
  { fullName: 'Jaziel Vazquez', groupNumber: 1 },
  { fullName: 'Abigail Vazquez', groupNumber: 1 },
  { fullName: 'Sabino Martinez', groupNumber: 1 },
  { fullName: 'Nadia de Martinez', groupNumber: 1 },
  { fullName: 'Alexander Ochoa', groupNumber: 1 },
  { fullName: 'Sergio Ochoa', groupNumber: 1 },
  { fullName: 'Martha de Ochoa', groupNumber: 1 },
  { fullName: 'Paola Cornejo', groupNumber: 1 },
  { fullName: 'Rosario de Ovalle', groupNumber: 1 },
  { fullName: 'Alejandra Martinez', groupNumber: 1 },

  // Grupo 2
  { fullName: 'David Novoa', groupNumber: 2 },
  { fullName: 'Gabriel Diaz', groupNumber: 2 },
  { fullName: 'Rosa Maria de Novoa', groupNumber: 2 },
  { fullName: 'Karina Alfaro', groupNumber: 2 },
  { fullName: 'Elvira Alfaro', groupNumber: 2 },
  { fullName: 'Angelica Lopez', groupNumber: 2 },
  { fullName: 'Rosalinda de Abasolo', groupNumber: 2 },
  { fullName: 'Estela de Silva', groupNumber: 2 },
  { fullName: 'Ana de Mejia', groupNumber: 2 },
  { fullName: 'Libni Mejia', groupNumber: 2 },
  { fullName: 'Norma de Lopez', groupNumber: 2 },
  { fullName: 'Eduardo Lopez', groupNumber: 2 },
  { fullName: 'Mireya de Diaz', groupNumber: 2 },
  { fullName: 'Maria Eugenia Rossete', groupNumber: 2 },
  { fullName: 'Xavier Valencia', groupNumber: 2 },
  { fullName: 'Socorro Torres', groupNumber: 2 },
  { fullName: 'Monserrat del Castillo', groupNumber: 2 },
  { fullName: 'Blanca de Aguilera', groupNumber: 2 },
  { fullName: 'Bertha Garcia', groupNumber: 2 },
  { fullName: 'Jose Luis Lopez', groupNumber: 2 },

  // Grupo 3
  { fullName: 'Abraham Gonzalez', groupNumber: 3 },
  { fullName: 'Uriel Salazar', groupNumber: 3 },
  { fullName: 'Nayely de Salazar', groupNumber: 3 },
  { fullName: 'Violeta de Gonzalez', groupNumber: 3 },
  { fullName: 'Patricia Matamoros', groupNumber: 3 },
  { fullName: 'Dominga Ventura', groupNumber: 3 },
  { fullName: 'Rocio Gonzalez', groupNumber: 3 },
  { fullName: 'Lidia Castro', groupNumber: 3 },
  { fullName: 'Miguel Diaz', groupNumber: 3 },
  { fullName: 'Irma Mondragon de Diaz', groupNumber: 3 },
  { fullName: 'Irma Diaz Mondragon', groupNumber: 3 },
  { fullName: 'Sebastian Cruz Diaz', groupNumber: 3 },
  { fullName: 'Emanuel Cruz Diaz', groupNumber: 3 },
  { fullName: 'Mary Patron', groupNumber: 3 },
  { fullName: 'Javier Escobedo', groupNumber: 3 },
  { fullName: 'Sicri Escobedo', groupNumber: 3 },
  { fullName: 'Rocio Urban', groupNumber: 3 },
  { fullName: 'Sohara Malpica', groupNumber: 3 },
  { fullName: 'Delia Malpica', groupNumber: 3 },
  { fullName: 'Silvia Reyes', groupNumber: 3 },

  // Grupo 4
  { fullName: 'Rogelio Teliz', groupNumber: 4 },
  { fullName: 'Kevin Rico', groupNumber: 4 },
  { fullName: 'Andrea de Teliz', groupNumber: 4 },
  { fullName: 'Jenifer Rico', groupNumber: 4 },
  { fullName: 'Carolina Monroy', groupNumber: 4 },
  { fullName: 'Fernanda Aco', groupNumber: 4 },
  { fullName: 'Veronica de Aco', groupNumber: 4 },
  { fullName: 'Jorge Aco', groupNumber: 4 },
  { fullName: 'Amparo Gonzalez', groupNumber: 4 },
  { fullName: 'Delia Gonzalez', groupNumber: 4 },
  { fullName: 'Dolores Ventura', groupNumber: 4 },
  { fullName: 'Emmanuel Rodriguez', groupNumber: 4 },
  { fullName: 'Susana de Rodriguez', groupNumber: 4 },
  { fullName: 'Enriqueta de Carlin', groupNumber: 4 },
  { fullName: 'Antonio Carlin', groupNumber: 4 },
  { fullName: 'Ruth Garcia', groupNumber: 4 },
  { fullName: 'Carmen Garcia', groupNumber: 4 },
  { fullName: 'Clara Morales', groupNumber: 4 },

  // Grupo 5
  { fullName: 'Rafael Gomez', groupNumber: 5 },
  { fullName: 'Oscar Sanchez', groupNumber: 5 },
  { fullName: 'Gloria de Gonzalez', groupNumber: 5 },
  { fullName: 'Marisol Cortez', groupNumber: 5 },
  { fullName: 'Cesia Malpica', groupNumber: 5 },
  { fullName: 'Mariela de Gomez', groupNumber: 5 },
  { fullName: 'Denise de Sanchez', groupNumber: 5 },
  { fullName: 'Camila Gonzalez', groupNumber: 5 },
  { fullName: 'Fany de Vazquez', groupNumber: 5 },
  { fullName: 'Fernando Vazquez', groupNumber: 5 },
  { fullName: 'Luis Vazquez', groupNumber: 5 },
  { fullName: 'Maira Osorio', groupNumber: 5 },
  { fullName: 'Scarlet Malpica', groupNumber: 5 },
  { fullName: 'Alejandro Juarez', groupNumber: 5 },
  { fullName: 'Susana Acosta de J', groupNumber: 5 },
  { fullName: 'Rocio de Barrios', groupNumber: 5 },
  { fullName: 'Guillermo Barrios', groupNumber: 5 },
  { fullName: 'Dulce Barrios', groupNumber: 5 },
  { fullName: 'Bertha Chino', groupNumber: 5 },
  { fullName: 'Blanca de Montoya', groupNumber: 5 },
];

export const normalizePersonName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const rosterByNormalizedName = new Map<string, CongregationMember>(
  CONGREGATION_ROSTER.map((member) => [normalizePersonName(member.fullName), member])
);

export const getCongregationRoster = (): CongregationMember[] => CONGREGATION_ROSTER;

export const findCongregationMemberByName = (fullName: string): CongregationMember | undefined =>
  rosterByNormalizedName.get(normalizePersonName(fullName));

export const hasCongregationMember = (fullName: string): boolean =>
  rosterByNormalizedName.has(normalizePersonName(fullName));
