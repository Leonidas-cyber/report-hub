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
    aliases: ['Juan Fernando Vazquez', 'Fernando Vazquez Tierrablanca', 'Fernando Juarez'],
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
    aliases: ['Emanuel Cruz', 'Alexandro Cruz', 'Emmanuel Cruz Diaz', 'Emanuel Cruz Diaz', 'Fernando Juarez'],
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

const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'los', 'viuda', 'vda', 'y']);

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

const phoneticKey = (word: string): string =>
  word
    .replace(/z/g, 's')
    .replace(/v/g, 'b')
    .replace(/y/g, 'i')
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1');

// Permite emparejar una inicial (ej. "p") con una palabra completa que empiece con esa letra (ej. "pacheco")
const tokensMatchOrInitial = (inputTok: string, targetTok: string): boolean => {
  if (inputTok === targetTok) return true;
  if (inputTok.length === 1 && targetTok.startsWith(inputTok)) return true;
  if (targetTok.length === 1 && inputTok.startsWith(targetTok)) return true;
  if (inputTok.length >= 3 && targetTok.length >= 3 && phoneticKey(inputTok) === phoneticKey(targetTok)) {
    return true;
  }
  return false;
};

const getMemberAllTokens = (member: CongregationMember): string[] => {
  const sources = [
    member.fullName,
    member.legalName ?? '',
    member.marriedSurname ?? '',
    ...(member.aliases ?? []),
  ];
  const tokenSet = new Set<string>();
  for (const src of sources) {
    for (const tok of tokenizeMeaningful(src)) {
      tokenSet.add(tok);
    }
  }
  return Array.from(tokenSet);
};

const rosterByNormalizedVariant = new Map<string, CongregationMember>();
for (const member of CONGREGATION_ROSTER) {
  const variants = [
    member.fullName,
    member.legalName,
    ...(member.aliases ?? []),
  ].filter(Boolean) as string[];

  for (const v of variants) {
    const key = normalizePersonName(v);
    if (key && !rosterByNormalizedVariant.has(key)) {
      rosterByNormalizedVariant.set(key, member);
    }
  }
}

export const getCongregationRoster = (): CongregationMember[] => CONGREGATION_ROSTER;

export const findCongregationMemberByName = (
  fullName: string,
  preferredGroupNumber?: number | null
): CongregationMember | undefined => {
  const normalizedInput = normalizePersonName(fullName);
  if (!normalizedInput) return undefined;

  const direct = rosterByNormalizedVariant.get(normalizedInput);
  if (direct) return direct;

  const inputTokens = tokenizeMeaningful(fullName);
  if (inputTokens.length === 0) return undefined;

  let bestCandidate: CongregationMember | undefined;
  let bestScore = 0;

  for (const member of CONGREGATION_ROSTER) {
    const memberTokens = getMemberAllTokens(member);

    let matchedCount = 0;
    let fullWordCount = 0;

    for (const inTok of inputTokens) {
      const matched = memberTokens.some((mTok) => tokensMatchOrInitial(inTok, mTok));
      if (matched) {
        matchedCount += 1;
        if (inTok.length > 1) {
          fullWordCount += 1;
        }
      }
    }

    const isSingleWordMember = tokenizeMeaningful(member.fullName).length === 1;
    
    // Si el nombre ingresado contiene la mayoría de los tokens del padrón o viceversa
    const meetsCoverage =
      (matchedCount >= Math.min(inputTokens.length, memberTokens.length) * 0.75 && fullWordCount >= 1) ||
      (isSingleWordMember && fullWordCount === 1);

    if (meetsCoverage) {
      let score = 0.80 + (matchedCount / Math.max(memberTokens.length, inputTokens.length)) * 0.15;

      const primaryTokens = [
        ...tokenizeMeaningful(member.fullName),
        ...tokenizeMeaningful(member.legalName ?? ''),
      ];
      if (primaryTokens.some((pt) => tokensMatchOrInitial(inputTokens[0], pt))) {
        score += 0.03;
      }

      if (preferredGroupNumber && member.groupNumber === preferredGroupNumber) {
        score += 0.05;
      }

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = member;
      }
    }
  }

  return bestCandidate;
};

export const hasCongregationMember = (fullName: string, preferredGroupNumber?: number | null): boolean =>
  Boolean(findCongregationMemberByName(fullName, preferredGroupNumber));

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

function memberSimilarityScore(inputName: string, member: CongregationMember): number {
  const inputTokens = tokenizeMeaningful(inputName);
  if (inputTokens.length === 0) return 0;

  const memberTokens = getMemberAllTokens(member);
  const matchedTokens = inputTokens.filter((inTok) =>
    memberTokens.some((mTok) => tokensMatchOrInitial(inTok, mTok))
  ).length;

  const tokenCoverage = matchedTokens / Math.max(inputTokens.length, 1);

  const normIn = normalizePersonName(inputName);
  const candidateStrings = [
    member.fullName,
    member.legalName ?? '',
    ...(member.aliases ?? []),
  ].filter(Boolean);

  let bestStringSim = 0;
  for (const str of candidateStrings) {
    const normTarget = normalizePersonName(str);
    const maxLen = Math.max(normIn.length, normTarget.length, 1);
    const levSim = 1 - levenshtein(normIn, normTarget) / maxLen;
    if (levSim > bestStringSim) bestStringSim = levSim;
  }

  return tokenCoverage * 0.7 + bestStringSim * 0.3;
}

export interface RosterMatch {
  member: CongregationMember;
  score: number;
}

export function findSimilarMembers(
  inputName: string,
  roster: CongregationMember[] = CONGREGATION_ROSTER,
  limit = 3,
  minScore = 0.30
): RosterMatch[] {
  const normalizedInput = normalizePersonName(inputName);
  if (!normalizedInput) return [];

  return roster
    .map((member) => ({
      member,
      score: memberSimilarityScore(inputName, member),
    }))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
