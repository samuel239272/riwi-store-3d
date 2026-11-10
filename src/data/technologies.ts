export interface Technology {
  id: string;
  name: string;
  category: string;
  description: string;
  application: string;
  color: string;
  icon?: string;
}
export const technologies: Technology[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Lenguaje de programación',
    description: 'Convierte una interfaz en una experiencia que responde a las personas.',
    application: 'Interacción y lógica del frontend.',
    color: '#F7DF1E',
    icon: 'javascript',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Lenguaje de programación',
    description: 'Añade tipos a JavaScript para construir aplicaciones más fáciles de mantener.',
    application: 'Interfaces y aplicaciones a escala.',
    color: '#3178C6',
    icon: 'typescript',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Lenguaje de programación',
    description: 'Una sintaxis clara para explorar datos y transformar ideas en herramientas.',
    application: 'Automatización y análisis de datos.',
    color: '#4d9cdb',
    icon: 'python',
  },
  {
    id: 'html',
    name: 'HTML',
    category: 'Lenguaje de marcado',
    description: 'Da estructura y significado al contenido de la web.',
    application: 'Contenido y estructura semántica.',
    color: '#E34F26',
    icon: 'html5',
  },
  {
    id: 'css',
    name: 'CSS',
    category: 'Lenguaje de estilos',
    description: 'Define la presentación, el ritmo visual y la adaptación a cada pantalla.',
    application: 'Diseño, animación y composición.',
    color: '#a77dff',
    icon: 'css',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Lenguaje de consultas',
    description: 'Expresa preguntas sobre datos organizados en tablas relacionadas.',
    application: 'Consulta y gestión de datos relacionales.',
    color: '#22D3EE',
  },
];
