export interface CongregationMember {
  fullName: string;
  groupNumber: number;
}

// Padrón base actualizado conforme a la nueva distribución de los seis grupos.
const CONGREGATION_ROSTER: CongregationMember[] = [
  // Grupo 1 — Valentin Callejas
  { fullName: 'Valentin Callejas', groupNumber: 1 },
  { fullName: 'Jorge Daniel Aco', groupNumber: 1 },
  { fullName: 'Ruth', groupNumber: 1 },
  { fullName: 'Susana Acosta', groupNumber: 1 },
  { fullName: 'Victor Gonzalez', groupNumber: 1 },
  { fullName: 'Mireya de Gonzalez', groupNumber: 1 },
  { fullName: 'Amparo Rivera', groupNumber: 1 },
  { fullName: 'Elia Gonzalez', groupNumber: 1 },
  { fullName: 'Anselmo Aco', groupNumber: 1 },
  { fullName: 'Veronica de Aco', groupNumber: 1 },
  { fullName: 'Esperanza Guzman de Callejas', groupNumber: 1 },
  { fullName: 'Fernanda Aco', groupNumber: 1 },
  { fullName: 'Clara Morales', groupNumber: 1 },
  { fullName: 'Jose Luis Lopez', groupNumber: 1 },
  { fullName: 'Carmen Garcia', groupNumber: 1 },

  // Grupo 2 — Rogelio Teliz
  { fullName: 'Rogelio Teliz', groupNumber: 2 },
  { fullName: 'Kevin Rico', groupNumber: 2 },
  { fullName: 'Andrea de Teliz', groupNumber: 2 },
  { fullName: 'Jenifer Rico', groupNumber: 2 },
  { fullName: 'Carolina Monroy', groupNumber: 2 },
  { fullName: 'Cesia Malpica', groupNumber: 2 },
  { fullName: 'Scarlet Malpica', groupNumber: 2 },
  { fullName: 'Sohara Malpica Delia', groupNumber: 2 },
  { fullName: 'Delia Malpica', groupNumber: 2 },
  { fullName: 'Antonio Carlin', groupNumber: 2 },
  { fullName: 'Enriqueta de Carlin', groupNumber: 2 },
  { fullName: 'Guillermo Barrios', groupNumber: 2 },
  { fullName: 'Rocio de Barrios', groupNumber: 2 },
  { fullName: 'Dulce Barrios', groupNumber: 2 },
  { fullName: 'Dolores Ventura', groupNumber: 2 },
  { fullName: 'Marisol Cortez', groupNumber: 2 },
  { fullName: 'Javier Escobedo', groupNumber: 2 },
  { fullName: 'Sicrisela de Escobedo', groupNumber: 2 },

  // Grupo 3 — Rafael Gomez
  { fullName: 'Rafael Gomez', groupNumber: 3 },
  { fullName: 'Oscar Sanchez', groupNumber: 3 },
  { fullName: 'Mariela de Gomez', groupNumber: 3 },
  { fullName: 'Denisse de Sanchez', groupNumber: 3 },
  { fullName: 'Susana de Juarez', groupNumber: 3 },
  { fullName: 'Alejandro Juarez', groupNumber: 3 },
  { fullName: 'Sofia Salazar', groupNumber: 3 },
  { fullName: 'Fernando Juarez', groupNumber: 3 },
  { fullName: 'Fanny de Vazquez', groupNumber: 3 },
  { fullName: 'Luis Vazquez', groupNumber: 3 },
  { fullName: 'Gloria Medina', groupNumber: 3 },
  { fullName: 'Camila Gonzalez', groupNumber: 3 },
  { fullName: 'Nitzy Gonzalez', groupNumber: 3 },
  { fullName: 'Bertha Chino', groupNumber: 3 },
  { fullName: 'Maira Osorio', groupNumber: 3 },
  { fullName: 'Lidia Peredo', groupNumber: 3 },
  { fullName: 'Azahel Romero Peredo', groupNumber: 3 },

  // Grupo 4 — David Novoa
  { fullName: 'David Novoa', groupNumber: 4 },
  { fullName: 'Leonardo Gonzalez P.', groupNumber: 4 },
  { fullName: 'Rosa Martinez de Novoa', groupNumber: 4 },
  { fullName: 'Claudia de Cornejo', groupNumber: 4 },
  { fullName: 'Paola Cornejo', groupNumber: 4 },
  { fullName: 'Dinora de Gaytan', groupNumber: 4 },
  { fullName: 'Rosario Ovalle', groupNumber: 4 },
  { fullName: 'Estela Ortega', groupNumber: 4 },
  { fullName: 'Moises Vazquez', groupNumber: 4 },
  { fullName: 'Griselda de Vazquez', groupNumber: 4 },
  { fullName: 'Abigail Vazquez', groupNumber: 4 },
  { fullName: 'Jaziel Vazquez', groupNumber: 4 },
  { fullName: 'Sergio Ochoa', groupNumber: 4 },
  { fullName: 'Marta de Ochoa', groupNumber: 4 },
  { fullName: 'Alexander Ochoa', groupNumber: 4 },
  { fullName: 'Sergio Gonzalez Pacheco', groupNumber: 4 },

  // Grupo 5 — Alberto Gonzalez P.
  { fullName: 'Alberto Gonzalez P.', groupNumber: 5 },
  { fullName: 'Gabriel Diaz', groupNumber: 5 },
  { fullName: 'Xavier Valencia', groupNumber: 5 },
  { fullName: 'Alejandra Martinez', groupNumber: 5 },
  { fullName: 'Maria Eugenia Rossete', groupNumber: 5 },
  { fullName: 'Monserrat del Castillo', groupNumber: 5 },
  { fullName: 'Eduardo Lopez', groupNumber: 5 },
  { fullName: 'Norma de Lopez', groupNumber: 5 },
  { fullName: 'Angelica Lopez', groupNumber: 5 },
  { fullName: 'Karina Alfaro', groupNumber: 5 },
  { fullName: 'Elvira Alfaro', groupNumber: 5 },
  { fullName: 'Socorro Torres', groupNumber: 5 },
  { fullName: 'Mireya Garcia de Diaz', groupNumber: 5 },
  { fullName: 'Libni Mejia Rivera', groupNumber: 5 },
  { fullName: 'Ana Gonzalez de Mejia', groupNumber: 5 },
  { fullName: 'Kimberly Mejia', groupNumber: 5 },

  // Grupo 6 — Abraham Gonzalez
  { fullName: 'Abraham Gonzalez', groupNumber: 6 },
  { fullName: 'Oscar Abrego', groupNumber: 6 },
  { fullName: 'Rocio Gonzalez', groupNumber: 6 },
  { fullName: 'Violeta Gomez de Gonzalez', groupNumber: 6 },
  { fullName: 'Blanca Flores', groupNumber: 6 },
  { fullName: 'Patricia Matamoros', groupNumber: 6 },
  { fullName: 'Dominga Ventura', groupNumber: 6 },
  { fullName: 'Rosalinda Cruz de Abasolo', groupNumber: 6 },
  { fullName: 'Irma Mondragon', groupNumber: 6 },
  { fullName: 'Miguel A Diaz', groupNumber: 6 },
  { fullName: 'Irma Diaz Mondragon', groupNumber: 6 },
  { fullName: 'Emmanuel Cruz', groupNumber: 6 },
  { fullName: 'Sebastian Cruz', groupNumber: 6 },
  { fullName: 'Lilia Castro', groupNumber: 6 },
  { fullName: 'Mari Patron', groupNumber: 6 },
  { fullName: 'Estela Silva', groupNumber: 6 },
];

// Se deriva del padrón cargado para evitar desfases en el conteo.
export const TOTAL_EXPECTED_REPORTERS = CONGREGATION_ROSTER.length;

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

// ─── Fuzzy matching ───────────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function similarityScore(a: string, b: string): number {
  const tokensA = new Set(a.split(' ').filter(Boolean));
  const tokensB = new Set(b.split(' ').filter(Boolean));
  const shared = [...tokensA].filter((t) => tokensB.has(t)).length;
  const tokenScore = shared / Math.max(tokensA.size, tokensB.size, 1);

  const maxLen = Math.max(a.length, b.length, 1);
  const levScore = 1 - levenshtein(a, b) / maxLen;

  return tokenScore * 0.6 + levScore * 0.4;
}

export interface RosterMatch {
  member: CongregationMember;
  score: number;
}

/**
 * Devuelve hasta `limit` miembros del padrón que más se parecen al nombre dado.
 * Umbral mínimo de similitud: minScore (0-1).
 */
export function findSimilarMembers(
  inputName: string,
  roster: CongregationMember[],
  limit = 3,
  minScore = 0.35
): RosterMatch[] {
  const normalizedInput = normalizePersonName(inputName);
  if (!normalizedInput) return [];

  return roster
    .map((member) => ({
      member,
      score: similarityScore(normalizedInput, normalizePersonName(member.fullName)),
    }))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
