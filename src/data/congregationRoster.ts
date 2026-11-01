export interface CongregationMember {
  fullName: string;
  legalName?: string;
  marriedSurname?: string;
  aliases?: string[];
  groupNumber: number;
}

export const GROUP_OVERSEERS: Record<number, string> = {
  1: 'Valentin Callejas',
  2: 'Rogelio Teliz',
  3: 'Rafael Gomez',
  4: 'David Novoa',
  5: 'Alberto Gonzalez P.',
  6: 'Abraham Gonzalez',
};

// Padrón oficial de 98 publicadores con soporte ampliado para abreviaturas e iniciales (P., G., etc.)
export const CONGREGATION_ROSTER: CongregationMember[] = [
  // ─── Grupo 1 — Valentin Callejas (15) ─────────────────────────────────────
  {
    fullName: 'Valentin Callejas',
    legalName: 'Jose Valentin Callejas Reyes',
    groupNumber: 1,
    aliases: ['Jose Callejas', 'Valentin Callejas Reyes', 'Jose Valentin Callejas', 'Valentin Reyes'],
  },
  {
    fullName: 'Jorge Daniel Aco',
    legalName: 'Jorge Daniel Aco Leon',
    groupNumber: 1,
    aliases: ['Jorge Aco', 'Daniel Aco', 'Jorge Aco Leon', 'Daniel Aco Leon'],
  },
  {
    fullName: 'Ruth',
    legalName: 'Ruth Garcia Sanchez',
    groupNumber: 1,
    aliases: ['Ruth Garcia', 'Ruth Sanchez', 'Ruth Garcia Sanchez'],
  },
  {
    fullName: 'Susana Acosta',
    legalName: 'Susana Alvarado Rodriguez',
    groupNumber: 1,
    aliases: ['Susana Alvarado', 'Susana Rodriguez'],
  },
  {
    fullName: 'Victor Gonzalez',
    legalName: 'Victor Angel Gonzalez Moreno',
    groupNumber: 1,
    aliases: ['Victor Angel Gonzalez', 'Victor Gonzalez Moreno', 'Angel Gonzalez Moreno', 'Victor Moreno'],
  },
  {
    fullName: 'Mireya de Gonzalez',
    legalName: 'Mireya Franco de Gonzalez',
    marriedSurname: 'de Gonzalez',
    groupNumber: 1,
    aliases: ['Mireya Franco', 'Mireya Gonzalez'],
  },
  {
    fullName: 'Amparo Rivera',
    legalName: 'Amparo Rivera',
    groupNumber: 1,
  },
  {
    fullName: 'Elia Gonzalez',
    legalName: 'Elia Gonzalez',
    groupNumber: 1,
  },
  {
    fullName: 'Anselmo Aco',
    legalName: 'Anselmo Aco',
    groupNumber: 1,
  },
  {
    fullName: 'Veronica de Aco',
    legalName: 'Veronica Leon de Aco',
    marriedSurname: 'de Aco',
    groupNumber: 1,
    aliases: ['Veronica Leon', 'Veronica Aco'],
  },
  {
    fullName: 'Esperanza Guzman de Callejas',
    legalName: 'Dionicia Esperanza Guzman',
    marriedSurname: 'de Callejas',
    groupNumber: 1,
    aliases: [
      'Esperanza Guzman',
      'Esperanza de Callejas',
      'Esperanza Callejas',
      'Dionicia Guzman',
      'Dionicia Esperanza Guzman de Callejas',
      'Dionicia de Callejas',
    ],
  },
  {
    fullName: 'Fernanda Aco',
    legalName: 'Leslie Fernanda Aco Leon',
    groupNumber: 1,
    aliases: ['Leslie Aco', 'Leslie Fernanda Aco', 'Fernanda Aco Leon', 'Leslie Aco Leon'],
  },
  {
    fullName: 'Clara Morales',
    legalName: 'Maria Q. Moralez Hortega',
    groupNumber: 1,
    aliases: [
      'Clara Moralez Hortega',
      'Clara Moralez',
      'Clara Morales Ortega',
      'Maria Q Moralez',
      'Maria Moralez Hortega',
      'Maria Morales',
    ],
  },
  {
    fullName: 'Jose Luis Lopez',
    legalName: 'Jose Luis Lopez Fernandez',
    groupNumber: 1,
    aliases: ['Jose Lopez', 'Luis Lopez', 'Jose Luis Lopez Fernandez', 'Jose Lopez Fernandez'],
  },
  {
    fullName: 'Carmen Garcia',
    legalName: 'Carmen Garcia',
    groupNumber: 1,
  },

  // ─── Grupo 2 — Rogelio Teliz (18) ─────────────────────────────────────────
  {
    fullName: 'Rogelio Teliz',
    legalName: 'Edgar Rogelio Teliz Taboada',
    groupNumber: 2,
    aliases: ['Edgar Teliz', 'Rogelio Teliz Taboada', 'Edgar Rogelio Teliz'],
  },
  {
    fullName: 'Kevin Rico',
    legalName: 'Kevin Rico Monroy',
    groupNumber: 2,
    aliases: ['Kevin Monroy'],
  },
  {
    fullName: 'Andrea de Teliz',
    legalName: 'Andrea Guadalupe Serrano Palacios',
    marriedSurname: 'de Teliz',
    groupNumber: 2,
    aliases: [
      'Andrea Serrano',
      'Andrea Teliz',
      'Andrea Guadalupe Serrano',
      'Andrea Serrano de Teliz',
      'Andrea Guadalupe de Teliz',
      'Guadalupe Serrano',
    ],
  },
  {
    fullName: 'Jenifer Rico',
    legalName: 'Jenniffer Maribel Rico Monroy',
    groupNumber: 2,
    aliases: [
      'Jenniffer Rico',
      'Jennifer Rico',
      'Maribel Rico',
      'Jenniffer Maribel Rico',
      'Jenifer Rico Monroy',
    ],
  },
  {
    fullName: 'Carolina Monroy',
    legalName: 'Carolina Monroy Maldonado',
    groupNumber: 2,
    aliases: ['Carolina Maldonado'],
  },
  {
    fullName: 'Cesia Malpica',
    legalName: 'Vera Cesiah Malpica Diaz',
    groupNumber: 2,
    aliases: ['Cesiah Malpica', 'Vera Malpica', 'Vera Cesiah Malpica', 'Cesia Malpica Diaz'],
  },
  {
    fullName: 'Scarlet Malpica',
    legalName: 'Scarlett Ivanna Malpica Diaz',
    groupNumber: 2,
    aliases: ['Scarlett Malpica', 'Ivanna Malpica', 'Scarlett Ivanna Malpica', 'Scarlet Malpica Diaz'],
  },
  {
    fullName: 'Sohara Malpica Delia',
    legalName: 'Zohara Malpica Diaz',
    groupNumber: 2,
    aliases: ['Sohara Malpica', 'Zohara Malpica', 'Sohara Malpica Diaz'],
  },
  {
    fullName: 'Delia Malpica',
    legalName: 'Delia Diaz Salas',
    marriedSurname: 'Viuda de Malpica',
    groupNumber: 2,
    aliases: ['Delia Diaz', 'Delia de Malpica', 'Delia Viuda de Malpica', 'Delia Salas'],
  },
  {
    fullName: 'Antonio Carlin',
    legalName: 'Antonio Carlin Hernandez',
    groupNumber: 2,
  },
  {
    fullName: 'Enriqueta de Carlin',
    legalName: 'Maria Enriqueta Lopez Moreno',
    marriedSurname: 'de Carlin',
    groupNumber: 2,
    aliases: [
      'Enriqueta Lopez',
      'Enriqueta Carlin',
      'Maria Enriqueta Lopez',
      'Maria Enriqueta de Carlin',
      'Enriqueta Lopez de Carlin',
    ],
  },
  {
    fullName: 'Guillermo Barrios',
    legalName: 'Guillermo Barrios Martinez',
    groupNumber: 2,
  },
  {
    fullName: 'Rocio de Barrios',
    legalName: 'Maria del Rocio Hernandez Rosales',
    marriedSurname: 'de Barrios',
    groupNumber: 2,
    aliases: [
      'Rocio Hernandez',
      'Rocio Barrios',
      'Maria del Rocio Hernandez',
      'Maria del Rocio de Barrios',
      'Rocio Hernandez de Barrios',
    ],
  },
  {
    fullName: 'Dulce Barrios',
    legalName: 'Dulce Analy Barrios Hernandez',
    groupNumber: 2,
    aliases: ['Dulce Analy Barrios', 'Analy Barrios', 'Dulce Barrios Hernandez'],
  },
  {
    fullName: 'Dolores Ventura',
    legalName: 'Benita Dolores Ventura Hernandez',
    groupNumber: 2,
    aliases: ['Benita Ventura', 'Benita Dolores Ventura', 'Dolores Ventura Hernandez'],
  },
  {
    fullName: 'Marisol Cortez',
    legalName: 'Marisol Cortez Zamora',
    groupNumber: 2,
    aliases: ['Marisol Cortes', 'Marisol Cortes Zamora'],
  },
  {
    fullName: 'Javier Escobedo',
    legalName: 'Jose Javier Escobedo Ruiz',
    groupNumber: 2,
    aliases: ['Jose Escobedo', 'Jose Javier Escobedo', 'Javier Escobedo Ruiz'],
  },
  {
    fullName: 'Sicrisela de Escobedo',
    legalName: 'Sicrisela Ramos Hernandez',
    marriedSurname: 'de Escobedo',
    groupNumber: 2,
    aliases: ['Sicrisela Ramos', 'Sicrisela Escobedo', 'Sicrisela Ramos de Escobedo'],
  },

  // ─── Grupo 3 — Rafael Gomez (17) ──────────────────────────────────────────
  {
    fullName: 'Rafael Gomez',
    legalName: 'Rafael Gomez Castaneda',
    groupNumber: 3,
  },
  {
    fullName: 'Oscar Sanchez',
    legalName: 'Oscar Sanchez Cano',
    groupNumber: 3,
  },
  {
    fullName: 'Mariela de Gomez',
    legalName: 'Mariela Morales de Gomez',
    marriedSurname: 'de Gomez',
    groupNumber: 3,
    aliases: ['Mariela Morales', 'Mariela Gomez'],
  },
  {
    fullName: 'Denisse de Sanchez',
    legalName: 'Denise Pinon de Sanchez',
    marriedSurname: 'de Sanchez',
    groupNumber: 3,
    aliases: ['Denise Pinon', 'Denisse Pinon', 'Denise de Sanchez', 'Denisse Sanchez', 'Denise Sanchez'],
  },
  {
    fullName: 'Susana de Juarez',
    legalName: 'Susana Selomit Acosta Salazar',
    marriedSurname: 'de Juarez',
    groupNumber: 3,
    aliases: [
      'Susana Selomit Acosta',
      'Susana Juarez',
      'Selomit Acosta',
      'Susana Acosta de Juarez',
      'Susana Salazar',
    ],
  },
  {
    fullName: 'Alejandro Juarez',
    legalName: 'Alejandro Juarez Aguirre',
    groupNumber: 3,
  },
  {
    fullName: 'Sofia Salazar',
    legalName: 'Sofia Salazar',
    groupNumber: 3,
  },
  {
    fullName: 'Fernando Vazquez',
    legalName: 'Juan Fernando Vazquez Tierrablanca',
    groupNumber: 3,
    aliases: ['Juan Fernando Vazquez', 'Fernando Vazquez Tierrablanca'],
  },
  {
    fullName: 'Fanny de Vazquez',
    legalName: 'Fanny Jocelyn Sanchez Garcia',
    marriedSurname: 'de Vazquez',
    groupNumber: 3,
    aliases: [
      'Fanny Sanchez',
      'Fanny Vazquez',
      'Fanny Jocelyn Sanchez',
      'Fanny Sanchez de Vazquez',
      'Jocelyn Sanchez',
    ],
  },
  {
    fullName: 'Luis Vazquez',
    legalName: 'Luis Fernando Vazquez Sanchez',
    groupNumber: 3,
    aliases: ['Luis Fernando Vazquez', 'Fernando Vazquez Sanchez', 'Luis Vazquez Sanchez'],
  },
  {
    fullName: 'Gloria Medina',
    legalName: 'Gloria Farrah Medina',
    marriedSurname: 'de Gonzalez',
    groupNumber: 3,
    aliases: ['Gloria de Gonzalez', 'Gloria Gonzalez', 'Gloria Farrah Medina de Gonzalez', 'Farrah Medina'],
  },
  {
    fullName: 'Camila Gonzalez',
    legalName: 'Camila Gonzalez Medina',
    groupNumber: 3,
  },
  {
    fullName: 'Nitzy Gonzalez',
    legalName: 'Nitzy Jaqueline Gonzalez Medina',
    groupNumber: 3,
    aliases: ['Nitzy Jaqueline Gonzalez', 'Jaqueline Gonzalez', 'Jaqueline Gonzalez Medina'],
  },
  {
    fullName: 'Bertha Chino',
    legalName: 'Bertha Chino',
    groupNumber: 3,
  },
  {
    fullName: 'Maira Osorio',
    legalName: 'Mayra Lourdes Osorio Solis',
    groupNumber: 3,
    aliases: ['Mayra Osorio', 'Maria Osorio', 'Lourdes Osorio', 'Mayra Osorio Solis'],
  },
  {
    fullName: 'Lidia Peredo',
    legalName: 'Lydia Jael Peredo Romero',
    groupNumber: 3,
    aliases: ['Lydia Peredo', 'Jael Peredo', 'Lidia Peredo Romero', 'Lydia Peredo Romero'],
  },
  {
    fullName: 'Azahel Romero Peredo',
    legalName: 'Asahel Jehosafat Romero Peredo',
    groupNumber: 3,
    aliases: ['Asahel Romero', 'Azahel Romero', 'Asahel Romero Peredo', 'Jehosafat Romero'],
  },

  // ─── Grupo 4 — David Novoa (16) ───────────────────────────────────────────
  {
    fullName: 'David Novoa',
    legalName: 'Raymundo David Novoa Hernandez',
    groupNumber: 4,
    aliases: ['Raymundo Novoa', 'Raymundo David Novoa', 'David Novoa Hernandez'],
  },
  {
    fullName: 'Leonardo Gonzalez P.',
    legalName: 'Leonardo Alberto Gonzalez Pacheco Gonzalez',
    groupNumber: 4,
    aliases: [
      'Leonardo Gonzalez',
      'Leonardo Gonzalez Pacheco',
      'Leonardo Alberto Gonzalez',
      'Leonardo Alberto Gonzalez Pacheco',
      'Leonardo Gonzalez Pacheco Gonzalez',
      'Leonardo G P',
      'Leonardo G',
    ],
  },
  {
    fullName: 'Rosa Martinez de Novoa',
    legalName: 'Rosa Maria Perez de Novoa',
    marriedSurname: 'de Novoa',
    groupNumber: 4,
    aliases: ['Rosa Perez de Novoa', 'Rosa de Novoa', 'Rosa Novoa', 'Rosa Maria Perez', 'Rosa Martinez'],
  },
  {
    fullName: 'Claudia de Cornejo',
    legalName: 'Claudia Munoz de Cornejo',
    marriedSurname: 'de Cornejo',
    groupNumber: 4,
    aliases: ['Claudia Munoz', 'Claudia Cornejo'],
  },
  {
    fullName: 'Paola Cornejo',
    legalName: 'Claudia Paola Cornejo Munoz',
    groupNumber: 4,
    aliases: ['Claudia Paola Cornejo', 'Paola Cornejo Munoz'],
  },
  {
    fullName: 'Dinora de Gaytan',
    legalName: 'Ana Dinorah Cornejo Guardado',
    marriedSurname: 'de Gaytan',
    groupNumber: 4,
    aliases: [
      'Dinorah Cornejo',
      'Dinora Cornejo',
      'Ana Dinorah Cornejo',
      'Dinorah de Gaytan',
      'Dinora Gaytan',
      'Ana Cornejo',
    ],
  },
  {
    fullName: 'Rosario Ovalle',
    legalName: 'Maria del Rosario Ovalle Rosas',
    marriedSurname: 'de Medina',
    groupNumber: 4,
    aliases: [
      'Rosario de Medina',
      'Rosario Medina',
      'Maria del Rosario Ovalle',
      'Maria del Rosario de Medina',
      'Rosario Ovalle Rosas',
    ],
  },
  {
    fullName: 'Estela Ortega',
    legalName: 'Estela Ortega',
    groupNumber: 4,
  },
  {
    fullName: 'Moises Vazquez',
    legalName: 'Moises Vazquez Sanchez',
    groupNumber: 4,
  },
  {
    fullName: 'Griselda de Vazquez',
    legalName: 'Griselda Miranda Jimenez',
    marriedSurname: 'de Vazquez',
    groupNumber: 4,
    aliases: ['Griselda Miranda', 'Griselda Vazquez', 'Griselda Miranda de Vazquez'],
  },
  {
    fullName: 'Abigail Vazquez',
    legalName: 'Aldara Abigail Vazquez Miranda',
    groupNumber: 4,
    aliases: ['Aldara Vazquez', 'Aldara Abigail Vazquez', 'Abigail Vazquez Miranda'],
  },
  {
    fullName: 'Jaziel Vazquez',
    legalName: 'Jaziel Israel Vazquez Miranda',
    groupNumber: 4,
    aliases: ['Jaziel Israel Vazquez', 'Israel Vazquez', 'Jaziel Vazquez Miranda'],
  },
  {
    fullName: 'Sergio Ochoa',
    legalName: 'Sergio Ochoa Mayorga',
    groupNumber: 4,
  },
  {
    fullName: 'Marta de Ochoa',
    legalName: 'Martha Beatriz Astilla Estilla',
    marriedSurname: 'de Ochoa',
    groupNumber: 4,
    aliases: [
      'Martha de Ochoa',
      'Martha Astilla',
      'Marta Astilla',
      'Martha Ochoa',
      'Marta Ochoa',
      'Martha Beatriz Astilla',
      'Beatriz Astilla',
    ],
  },
  {
    fullName: 'Alexander Ochoa',
    legalName: 'Sergio Alexander Ochoa Astilla',
    groupNumber: 4,
    aliases: ['Sergio Alexander Ochoa', 'Alexander Ochoa Astilla'],
  },
  {
    fullName: 'Sergio Gonzalez Pacheco',
    legalName: 'Sergio Gonzalez Pacheco',
    groupNumber: 4,
    aliases: ['Sergio Gonzalez', 'Sergio Gonzalez P', 'Sergio G P'],
  },

  // ─── Grupo 5 — Alberto Gonzalez P. (16) ───────────────────────────────────
  {
    fullName: 'Alberto Gonzalez P.',
    legalName: 'Luis Alberto Gonzalez Pacheco Prado',
    groupNumber: 5,
    aliases: [
      'Alberto Gonzalez',
      'Luis Alberto Gonzalez',
      'Alberto Gonzalez Pacheco',
      'Luis Alberto Gonzalez Pacheco',
      'Alberto Gonzalez Prado',
      'Alberto G P',
      'Alberto Gonzalez Pacheco Prado',
    ],
  },
  {
    fullName: 'Gabriel Diaz',
    legalName: 'Gabriel Diaz Tena',
    groupNumber: 5,
  },
  {
    fullName: 'Xavier Valencia',
    legalName: 'Xavier Deyavne Valencia Leon',
    groupNumber: 5,
    aliases: ['Javier Valencia', 'Xavier Valencia Leon', 'Deyavne Valencia'],
  },
  {
    fullName: 'Alejandra Martinez',
    legalName: 'Rosa Alejandra Martinez Sarmiento',
    groupNumber: 5,
    aliases: ['Rosa Alejandra Martinez', 'Alejandra Martinez Sarmiento'],
  },
  {
    fullName: 'Maria Eugenia Rossete',
    legalName: 'Maria Eugenia Garcia Rosete',
    groupNumber: 5,
    aliases: ['Maria Eugenia Rosete', 'Maria Eugenia Garcia', 'Eugenia Rosete', 'Eugenia Garcia'],
  },
  {
    fullName: 'Monserrat del Castillo',
    legalName: 'Monserrat Caro del Castillo Lopez',
    groupNumber: 5,
    aliases: ['Monserrat Caro', 'Monserrat Castillo', 'Montserrat del Castillo', 'Monserrat Lopez'],
  },
  {
    fullName: 'Eduardo Lopez',
    legalName: 'Eduardo Lopez Hernandez',
    groupNumber: 5,
  },
  {
    fullName: 'Norma de Lopez',
    legalName: 'Norma Angelica Lopez de Lopez',
    marriedSurname: 'de Lopez',
    groupNumber: 5,
    aliases: ['Norma Lopez', 'Norma Angelica Lopez'],
  },
  {
    fullName: 'Angelica Lopez',
    legalName: 'Edna Angelica Lopez Lopez',
    groupNumber: 5,
    aliases: ['Edna Lopez', 'Edna Angelica Lopez', 'Angelica Lopez Lopez'],
  },
  {
    fullName: 'Karina Alfaro',
    legalName: 'Karina Acenett Alfaro Rosales',
    groupNumber: 5,
    aliases: ['Karina Acenett Alfaro', 'Acenett Alfaro', 'Karina Alfaro Rosales'],
  },
  {
    fullName: 'Elvira Alfaro',
    legalName: 'Elvira Rosales Sanchez',
    marriedSurname: 'de Alfaro',
    groupNumber: 5,
    aliases: ['Elvira de Alfaro', 'Elvira Rosales', 'Elvira Rosales de Alfaro'],
  },
  {
    fullName: 'Socorro Torres',
    legalName: 'Maria del Socorro Torres Cedillo',
    groupNumber: 5,
    aliases: ['Maria del Socorro Torres', 'Socorro Torres Cedillo'],
  },
  {
    fullName: 'Mireya Garcia de Diaz',
    legalName: 'Mireya Garcia Olivares',
    marriedSurname: 'de Diaz',
    groupNumber: 5,
    aliases: ['Mireya Garcia', 'Mireya de Diaz', 'Mireya Diaz', 'Mireya Olivares'],
  },
  {
    fullName: 'Libni Mejia Rivera',
    legalName: 'Libni Mejia Castro',
    groupNumber: 5,
    aliases: ['Libni Mejia', 'Libni Castro'],
  },
  {
    fullName: 'Ana Gonzalez de Mejia',
    legalName: 'Ana Jokebed Gonzalez Gomez',
    marriedSurname: 'de Mejia',
    groupNumber: 5,
    aliases: [
      'Ana Gonzalez',
      'Ana de Mejia',
      'Ana Mejia',
      'Ana Jokebed Gonzalez',
      'Jokebed Gonzalez',
      'Ana Gonzalez Gomez',
    ],
  },
  {
    fullName: 'Kimberly Mejia',
    legalName: 'Kimberly Jael Mejia Gonzalez',
    groupNumber: 5,
    aliases: ['Kimberly Jael Mejia', 'Kimberly Mejia Gonzalez', 'Jael Mejia'],
  },

  // ─── Grupo 6 — Abraham Gonzalez (16) ──────────────────────────────────────
  {
    fullName: 'Abraham Gonzalez',
    legalName: 'Abraham Gonzalez Rodriguez',
    groupNumber: 6,
  },
  {
    fullName: 'Oscar Abrego',
    legalName: 'Oscar Gibran Abrego Alvarez',
    groupNumber: 6,
    aliases: ['Oscar Gibran Abrego', 'Gibran Abrego', 'Oscar Abrego Alvarez'],
  },
  {
    fullName: 'Rocio Gonzalez',
    legalName: 'Rocio Gonzalez Garcia',
    groupNumber: 6,
  },
  {
    fullName: 'Violeta Gomez de Gonzalez',
    legalName: 'Lorena Violeta Gomez Gonzalez',
    marriedSurname: 'de Gonzalez',
    groupNumber: 6,
    aliases: [
      'Violeta Gomez',
      'Violeta de Gonzalez',
      'Violeta Gonzalez',
      'Lorena Gomez',
      'Lorena Violeta Gomez',
      'Lorena de Gonzalez',
    ],
  },
  {
    fullName: 'Blanca Flores',
    legalName: 'Blanca Aguilera Hernandez',
    marriedSurname: 'de Flores',
    groupNumber: 6,
    aliases: ['Blanca de Flores', 'Blanca Aguilera', 'Blanca Aguilera de Flores'],
  },
  {
    fullName: 'Patricia Matamoros',
    legalName: 'Martha Patricia Matamoros Ventura',
    groupNumber: 6,
    aliases: ['Martha Matamoros', 'Martha Patricia Matamoros', 'Patricia Matamoros Ventura'],
  },
  {
    fullName: 'Dominga Ventura',
    legalName: 'Dominga Ventura Ventura',
    groupNumber: 6,
  },
  {
    fullName: 'Rosalinda Cruz de Abasolo',
    legalName: 'Rosalinda Cruz Sosa',
    marriedSurname: 'de Abasolo',
    groupNumber: 6,
    aliases: ['Rosalinda Cruz', 'Rosalinda de Abasolo', 'Rosalinda Abasolo', 'Rosalinda Cruz Sosa'],
  },
  {
    fullName: 'Irma Mondragon',
    legalName: 'Irma Mondragon Osorio',
    marriedSurname: 'de Diaz',
    groupNumber: 6,
    aliases: ['Irma de Diaz', 'Irma Mondragon de Diaz', 'Irma Osorio'],
  },
  {
    fullName: 'Miguel A Diaz',
    legalName: 'Miguel Angel Diaz',
    groupNumber: 6,
    aliases: ['Miguel Diaz', 'Miguel A. Diaz'],
  },
  {
    fullName: 'Irma Diaz Mondragon',
    legalName: 'Irma Diaz Mondragon',
    groupNumber: 6,
    aliases: ['Irma Diaz'],
  },
  {
    fullName: 'Emmanuel Cruz',
    legalName: 'Emanuel Alexandro Cruz Diaz',
    groupNumber: 6,
    aliases: ['Emanuel Cruz', 'Alexandro Cruz', 'Emmanuel Cruz Diaz', 'Emanuel Cruz Diaz'],
  },
  {
    fullName: 'Sebastian Cruz',
    legalName: 'Samuel Sebastian Cruz Diaz',
    groupNumber: 6,
    aliases: ['Samuel Cruz', 'Samuel Sebastian Cruz', 'Sebastian Cruz Diaz', 'Samuel Cruz Diaz'],
  },
  {
    fullName: 'Lilia Castro',
    legalName: 'Lilia Castro Barrera',
    groupNumber: 6,
  },
  {
    fullName: 'Mari Patron',
    legalName: 'Maria Patron Romano',
    groupNumber: 6,
    aliases: ['Maria Patron', 'Mary Patron', 'Maria Patron Romano'],
  },
  {
    fullName: 'Estela Silva',
    legalName: 'Maria Estela Ramirez Licona',
    marriedSurname: 'de Silva',
    groupNumber: 6,
    aliases: [
      'Estela de Silva',
      'Estela Ramirez',
      'Maria Estela Ramirez',
      'Maria Estela de Silva',
      'Estela Ramirez de Silva',
    ],
  },
];

export const TOTAL_EXPECTED_REPORTERS = CONGREGATION_ROSTER.length;

// ═════════════════════════════════════════════════════════════════════════════
//  REEMPLAZA TODO LO QUE VA DESDE `const STOPWORDS` HASTA EL FINAL DEL ARCHIVO
//  (el padrón CONGREGATION_ROSTER y GROUP_OVERSEERS quedan intactos).
//  Mantiene la API: normalizePersonName, getCongregationRoster,
//  findCongregationMemberByName, hasCongregationMember, findSimilarMembers.
// ═════════════════════════════════════════════════════════════════════════════

const STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'los', 'viuda', 'vda', 'y',
  // tratamientos que a veces se cuelan en los reportes
  'hno', 'hermano', 'hna', 'hermana', 'sr', 'sra', 'srita', 'sta',
]);

/** Score mínimo para aceptar una coincidencia automática. */
const MATCH_THRESHOLD = 0.8;
/** Si el 2º mejor candidato (otra persona) queda a menos de esto, es ambiguo. */
const AMBIGUITY_MARGIN = 0.04;
/** Bonus por pertenecer al grupo preferido (solo desempata). */
const GROUP_BONUS = 0.04;

export const normalizePersonName = (value: string): string =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const tokenizeMeaningful = (value: string): string[] =>
  normalizePersonName(value)
    .split(' ')
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));

// ─── Fonética del español ────────────────────────────────────────────────────
// Reduce una palabra a una "huella de sonido" para que b/v, s/z/c, ll/y, j/g,
// x/j, qu/k, h muda, letras dobles, etc. den la misma clave.
const phoneticKey = (word: string): string =>
  word
    .replace(/ph/g, 'f')
    .replace(/ch/g, '4') // conserva "ch" antes de quitar la h muda
    .replace(/ll/g, 'y')
    .replace(/qu/g, 'k')
    .replace(/gu([ei])/g, 'g$1')
    .replace(/c([ei])/g, 's$1')
    .replace(/z/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/g([ei])/g, 'j$1')
    .replace(/[xj]/g, 'j')
    .replace(/w/g, 'u')
    .replace(/v/g, 'b')
    .replace(/y/g, 'i')
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1');

// ─── Distancia de edición (Damerau-Levenshtein / OSA) ────────────────────────
// Cuenta una transposición ("Gonzlaez" → "Gonzalez") como 1 error, no 2.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

const stringSimilarity = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - editDistance(a, b) / maxLen;
};

// ─── Similitud entre dos palabras (0..1) ─────────────────────────────────────
function tokenSimilarity(a: string, pa: string, b: string, pb: string): number {
  if (a === b) return 1;

  // Iniciales: "p" ↔ "pacheco"
  if (a.length === 1 || b.length === 1) return a[0] === b[0] ? 0.8 : 0;

  // Mismo sonido en español (Valentin/Balentin, Jesica/Yesica, Xavier/Javier)
  if (pa === pb) return 0.97;

  const minLen = Math.min(a.length, b.length);

  // Abreviaturas por prefijo: "Gonz" ↔ "Gonzalez", "Guill" ↔ "Guillermo"
  if (minLen >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.85;

  // Palabras muy cortas: solo exactas o fonéticas (evita Ana≈Ada, Luis≈Luz)
  if (minLen <= 3) return 0;

  const raw = stringSimilarity(a, b);
  const phon = stringSimilarity(pa, pb) * 0.97;
  const s = Math.max(raw, phon);
  return s >= 0.7 ? s : 0;
}

// ─── Índice precalculado del padrón ──────────────────────────────────────────
interface NameForm {
  norm: string;       // "jose luis lopez"
  compact: string;    // "joseluislopez" (sin espacios)
  tokens: string[];
  phon: string[];
}

interface IndexedMember {
  member: CongregationMember;
  forms: NameForm[];
}

const buildForm = (raw: string): NameForm | null => {
  const tokens = tokenizeMeaningful(raw);
  if (tokens.length === 0) return null;
  return {
    norm: tokens.join(' '),
    compact: tokens.join(''),
    tokens,
    phon: tokens.map(phoneticKey),
  };
};

const buildIndex = (roster: CongregationMember[]): IndexedMember[] =>
  roster.map((member) => {
    const seen = new Set<string>();
    const forms: NameForm[] = [];
    const raws = [member.fullName, member.legalName ?? '', ...(member.aliases ?? [])];
    for (const raw of raws) {
      const f = buildForm(raw);
      if (f && !seen.has(f.norm)) {
        seen.add(f.norm);
        forms.push(f);
      }
    }
    return { member, forms };
  });

const ROSTER_INDEX: IndexedMember[] = buildIndex(CONGREGATION_ROSTER);

// Coincidencia exacta (normalizada) → lista, porque un alias puede repetirse
const rosterByNormalizedVariant = new Map<string, CongregationMember[]>();
for (const { member, forms } of ROSTER_INDEX) {
  for (const f of forms) {
    const list = rosterByNormalizedVariant.get(f.norm) ?? [];
    if (!list.includes(member)) list.push(member);
    rosterByNormalizedVariant.set(f.norm, list);
  }
}

// ─── Puntuación de una entrada contra UNA forma de nombre ────────────────────
function scoreAgainstForm(inTokens: string[], inPhon: string[], inCompact: string, form: NameForm): number {
  // 1) Alineación palabra-a-palabra (uno a uno, sin importar el orden)
  const pairs: { i: number; j: number; s: number }[] = [];
  for (let i = 0; i < inTokens.length; i++) {
    for (let j = 0; j < form.tokens.length; j++) {
      const s = tokenSimilarity(inTokens[i], inPhon[i], form.tokens[j], form.phon[j]);
      if (s > 0) pairs.push({ i, j, s });
    }
  }
  pairs.sort((x, y) => y.s - x.s);

  const usedI = new Set<number>();
  const usedJ = new Set<number>();
  let sum = 0;
  let strong = 0;
  for (const p of pairs) {
    if (usedI.has(p.i) || usedJ.has(p.j)) continue;
    usedI.add(p.i);
    usedJ.add(p.j);
    sum += p.s;
    if (inTokens[p.i].length > 1 && p.s >= 0.85) strong++;
  }

  let tokenScore = 0;
  if (strong > 0) {
    const precision = sum / inTokens.length;  // ¿qué tanto de lo escrito encaja?
    const recall = sum / form.tokens.length;  // ¿qué tanto del nombre cubrí?
    tokenScore = precision * 0.75 + recall * 0.25;
  }

  // 2) Comparación "pegada" (espacios mal puestos: "Joseluis", "Maria Del Rocio"
  //    vs "Mariadel Rocio", "Gonzalezpacheco"). Compara en crudo y en fonético.
  let compactScore = 0;
  if (inCompact.length >= 5 && form.compact.length >= 5) {
    const raw = stringSimilarity(inCompact, form.compact);
    const phon = stringSimilarity(phoneticKey(inCompact), phoneticKey(form.compact)) * 0.97;
    const best = Math.max(raw, phon);
    if (best >= 0.88) compactScore = best * 0.98;
  }

  return Math.max(tokenScore, compactScore);
}

// ─── Puntuación de una entrada contra un miembro (mejor de sus formas) ───────
function scoreMember(inTokens: string[], inPhon: string[], inCompact: string, im: IndexedMember): number {
  let best = 0;
  for (const form of im.forms) {
    const s = scoreAgainstForm(inTokens, inPhon, inCompact, form);
    if (s > best) best = s;
  }
  return best;
}

export interface RosterMatch {
  member: CongregationMember;
  score: number;
}

/** Ranking completo de candidatos (ordenado de mayor a menor score). */
function rankMembers(
  inputName: string,
  preferredGroupNumber?: number | null,
  index: IndexedMember[] = ROSTER_INDEX
): RosterMatch[] {
  const inTokens = tokenizeMeaningful(inputName);
  if (inTokens.length === 0) return [];
  const inPhon = inTokens.map(phoneticKey);
  const inCompact = inTokens.join('');

  const ranked: RosterMatch[] = [];
  for (const im of index) {
    let score = scoreMember(inTokens, inPhon, inCompact, im);
    if (score <= 0) continue;
    if (preferredGroupNumber && im.member.groupNumber === preferredGroupNumber) {
      score = Math.min(1, score + GROUP_BONUS);
    }
    ranked.push({ member: im.member, score });
  }
  return ranked.sort((a, b) => b.score - a.score);
}

export interface NameMatchResult {
  member?: CongregationMember;
  score: number;
  /** true si hay dos o más personas igual de probables (no se eligió ninguna). */
  ambiguous: boolean;
  /** Otros candidatos cercanos, útil para mostrar "¿Quisiste decir…?" */
  alternatives: RosterMatch[];
}

/** Versión detallada: devuelve score, ambigüedad y alternativas. */
export function matchCongregationMember(
  fullName: string,
  preferredGroupNumber?: number | null
): NameMatchResult {
  const normalizedInput = normalizePersonName(fullName);
  if (!normalizedInput) return { score: 0, ambiguous: false, alternatives: [] };

  // Atajo: coincidencia exacta normalizada
  const exact = rosterByNormalizedVariant.get(tokenizeMeaningful(fullName).join(' '));
  if (exact && exact.length === 1) {
    return { member: exact[0], score: 1, ambiguous: false, alternatives: [] };
  }
  if (exact && exact.length > 1) {
    const inGroup = preferredGroupNumber
      ? exact.filter((m) => m.groupNumber === preferredGroupNumber)
      : [];
    if (inGroup.length === 1) {
      return { member: inGroup[0], score: 1, ambiguous: false, alternatives: [] };
    }
    return {
      score: 1,
      ambiguous: true,
      alternatives: exact.map((member) => ({ member, score: 1 })),
    };
  }

  const ranked = rankMembers(fullName, preferredGroupNumber);
  const best = ranked[0];
  if (!best || best.score < MATCH_THRESHOLD) {
    return { score: best?.score ?? 0, ambiguous: false, alternatives: ranked.slice(0, 3) };
  }

  const rival = ranked.find((r) => r.member !== best.member);
  if (rival && best.score - rival.score < AMBIGUITY_MARGIN) {
    return { score: best.score, ambiguous: true, alternatives: ranked.slice(0, 3) };
  }

  return {
    member: best.member,
    score: best.score,
    ambiguous: false,
    alternatives: ranked.slice(1, 4),
  };
}

export const getCongregationRoster = (): CongregationMember[] => CONGREGATION_ROSTER;

export const findCongregationMemberByName = (
  fullName: string,
  preferredGroupNumber?: number | null
): CongregationMember | undefined =>
  matchCongregationMember(fullName, preferredGroupNumber).member;

export const hasCongregationMember = (fullName: string, preferredGroupNumber?: number | null): boolean =>
  Boolean(findCongregationMemberByName(fullName, preferredGroupNumber));

/** Sugerencias para "¿quisiste decir…?" cuando no hay coincidencia segura. */
export function findSimilarMembers(
  inputName: string,
  roster: CongregationMember[] = CONGREGATION_ROSTER,
  limit = 3,
  minScore = 0.5
): RosterMatch[] {
  if (!normalizePersonName(inputName)) return [];
  const index = roster === CONGREGATION_ROSTER ? ROSTER_INDEX : buildIndex(roster);
  return rankMembers(inputName, null, index)
    .filter((m) => m.score >= minScore)
    .slice(0, limit);
}
