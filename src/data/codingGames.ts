export type GameId = 'debug' | 'pipeline';
export interface CodingLevel {
  title: string;
  concept: string;
  task: string;
  hint: string;
  explanation: string;
  code?: string;
  answers?: string[];
  lines?: string[];
}
export const games = {
  debug: {
    name: 'Debug Quest',
    tag: 'COMPLETA · CORRIGE · APRENDE',
    description: 'Un pequeño hueco. Una gran idea. Completa el código y encuentra la solución.',
    file: 'debug.js',
  },
  pipeline: {
    name: 'Build Pipeline',
    tag: 'ORDENA · CONECTA · CONSTRUYE',
    description:
      'Cada línea tiene su momento. Ordena las piezas para que el programa tenga sentido.',
    file: 'pipeline.js',
  },
} as const;
export const gameLevels: Record<GameId, CodingLevel[]> = {
  debug: [
    {
      title: 'Tu primer hello',
      concept: 'Cadenas de texto · Muy fácil',
      task: 'Completa el espacio con el texto Hola, RIWI! entre comillas.',
      code: 'const saludo = ___;\nconsole.log(saludo);',
      answers: ['"Hola, RIWI!"', "'Hola, RIWI!'", '`Hola, RIWI!`'],
      hint: 'En JavaScript, el texto se escribe entre comillas. Conserva la coma, el espacio y el signo de admiración.',
      explanation:
        'Las comillas convierten las palabras en una cadena de texto. ¡Tu primer mensaje está listo!',
    },
    {
      title: 'Todo suma',
      concept: 'Variables y operadores · Fácil',
      task: 'Usa las variables precio y envio para calcular el total.',
      code: 'const precio = 40;\nconst envio = 5;\nconst total = ___; // 45',
      answers: ['precio + envio', 'envio + precio'],
      hint: 'El operador + suma dos números. Usa los nombres de las variables.',
      explanation: 'Sumar variables permite reutilizar el cálculo aunque cambien sus valores.',
    },
    {
      title: 'La puerta lógica',
      concept: 'Condicionales · Fácil',
      task: 'Permite entrar cuando edad sea mayor o igual a 18. El valor 18 también debe pasar.',
      code: 'const edad = 18;\nif (___) {\n  console.log("Acceso permitido");\n}',
      answers: ['edad >= 18', '18 <= edad'],
      hint: '>= significa mayor o igual. Usar solamente > dejaría fuera a quienes tienen 18.',
      explanation:
        'Los límites cuentan: >= incluye el valor del umbral, mientras que > lo excluye.',
    },
    {
      title: 'Fuera de stock',
      concept: 'Arrays y filter · Intermedio',
      task: 'Conserva solo productos cuyo stock sea mayor que cero.',
      code: 'const disponibles = productos.filter(\n  producto => ___\n);',
      answers: ['producto.stock > 0', '0 < producto.stock', 'producto.stock >= 1'],
      hint: 'Accede a la propiedad con producto.stock y compárala con cero. El inventario contiene cantidades enteras.',
      explanation: 'filter crea un nuevo array con los elementos cuya condición devuelve true.',
    },
    {
      title: 'Precio compilado',
      concept: 'Funciones y porcentajes · Intermedio',
      task: 'Devuelve precio con un 10 % de descuento. Usa una expresión, sin return ni punto y coma.',
      code: 'const aplicarDescuento = precio => ___;\n// aplicarDescuento(100) → 90',
      answers: [
        'precio * 0.9',
        '0.9 * precio',
        'precio - precio * 0.1',
        'precio * (1 - 0.1)',
        'precio * 90 / 100',
        'precio - (precio * 0.1)',
      ],
      hint: 'Después de descontar el 10 %, queda el 90 %. En decimal, 90 % es 0.9.',
      explanation: 'Una función flecha de una expresión devuelve su resultado de forma implícita.',
    },
    {
      title: 'Espera tu respuesta',
      concept: 'Async / await · Desafío',
      task: 'Completa la palabra que espera a que fetch resuelva su promesa.',
      code: 'async function cargarProductos() {\n  const respuesta = ___ fetch("/api/productos");\n  return respuesta.json();\n}',
      answers: ['await'],
      hint: 'La función ya es async. La palabra complementaria pausa esta función hasta que la promesa se resuelva.',
      explanation:
        'await espera la promesa sin bloquear toda la página. En una aplicación real también manejarías los errores de red.',
    },
  ],
  pipeline: [
    {
      title: 'De arriba abajo',
      concept: 'Orden de ejecución · Muy fácil',
      task: 'Declara el saludo, imprímelo y después anuncia que terminaste.',
      lines: ['const saludo = "Hola";', 'console.log(saludo);', 'console.log("Listo");'],
      hint: 'Primero necesitas crear la variable que quieres usar.',
      explanation:
        'JavaScript ejecuta estas instrucciones de arriba abajo. Una variable const debe declararse antes de usarla.',
    },
    {
      title: 'El ticket correcto',
      concept: 'Dependencias · Fácil',
      task: 'Define el precio, calcula el total con 5 de envío y muéstralo.',
      lines: ['const precio = 40;', 'const total = precio + 5;', 'console.log(total);'],
      hint: 'El total depende del precio; el mensaje depende del total.',
      explanation: 'Las dependencias determinan el orden: precio → total → salida.',
    },
    {
      title: 'Una decisión',
      concept: 'Bloques if · Fácil',
      task: 'Construye un condicional que anuncie Disponible cuando haya stock.',
      lines: ['const stock = 3;', 'if (stock > 0) {', '  console.log("Disponible");', '}'],
      hint: 'Declara stock antes de comprobarlo. El mensaje va entre las llaves.',
      explanation:
        'Las llaves delimitan las instrucciones que se ejecutan si la condición es verdadera.',
    },
    {
      title: 'Tu primera función',
      concept: 'Funciones · Intermedio',
      task: 'Define sumar como función flecha y úsala para imprimir 7.',
      lines: ['const sumar = (a, b) => {', '  return a + b;', '};', 'console.log(sumar(3, 4));'],
      hint: 'El return pertenece al cuerpo de la función. Cierra la función antes de llamarla.',
      explanation: 'Una función declarada con const debe inicializarse antes de invocarse.',
    },
    {
      title: 'Transforma el array',
      concept: 'Filter + map · Intermedio',
      task: 'Parte de los precios, conserva los mayores de 20, aplica 10 % de descuento e imprime el resultado.',
      lines: [
        'const precios = [10, 30, 50];',
        'const elegidos = precios.filter(p => p > 20);',
        'const finales = elegidos.map(p => p * 0.9);',
        'console.log(finales); // [27, 45]',
      ],
      hint: 'filter selecciona los elementos; map transforma cada elemento seleccionado.',
      explanation: 'Combinar filter y map permite construir transformaciones pequeñas y legibles.',
    },
    {
      title: 'Misión asíncrona',
      concept: 'Flujo asíncrono · Desafío',
      task: 'Define cargar, espera la respuesta, lee el JSON y devuelve los datos.',
      lines: [
        'async function cargar() {',
        '  const respuesta = await fetch("/api/productos");',
        '  const datos = await respuesta.json();',
        '  return datos;',
        '}',
      ],
      hint: 'Necesitas la respuesta antes de leer su cuerpo; necesitas los datos antes de devolverlos.',
      explanation:
        'Cada await respeta una dependencia asíncrona. La función devuelve una promesa con los datos.',
    },
  ],
};
export const percentages = [3, 5, 7, 10, 12, 15];
export const levelId = (game: GameId, index: number) => `${game}:${index}`;
export interface CodingReward {
  id: string;
  code: string;
  percent: number;
  game: GameId;
  level: number;
}
export const rewards: CodingReward[] = (['debug', 'pipeline'] as GameId[]).flatMap((game) =>
  gameLevels[game].map((_, index) => ({
    id: levelId(game, index),
    code: `RIWI-${game.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
    percent: percentages[index],
    game,
    level: index + 1,
  })),
);
// Normalize whitespace outside strings only. No user code is executed.
export function normalizeAnswer(value: string) {
  return (
    value.trim().match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\S/g) ?? []
  ).join('');
}
export function isCorrect(game: GameId, index: number, answer: string | number[]) {
  const level = gameLevels[game]?.[index];
  if (!level) return false;
  if (game === 'debug')
    return (
      typeof answer === 'string' &&
      answer.length < 300 &&
      level.answers!.some((expected) => normalizeAnswer(expected) === normalizeAnswer(answer))
    );
  return (
    Array.isArray(answer) &&
    answer.length === level.lines!.length &&
    answer.every((line, position) => line === position)
  );
}
export function discountedTotal(total: number, reward: CodingReward | null) {
  const discount = reward ? Math.round((total * reward.percent) / 100) : 0;
  return { discount, payable: Math.max(0, total - discount) };
}
