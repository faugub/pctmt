// Seed glossary for the tactical taxonomy on strategies and training blocks.
// Source: docs/voz-del-entrenador.md — "Glosario táctico de base".
//
// This list is a starting point, not a closed vocabulary. The coach can
// always type a custom tag in the UI; these are just the defaults that
// make the picker useful from day one instead of an empty text box.
// Grow this list as real use surfaces gaps — see the doc's closing note.

export const CONCEPT_TAGS = [
  'juego en diagonal',
  'juego en paralelo',
  'transición',
  'defensa en el medio',
  'defensa acorralada',
  'finalización en la red',
  'decisión bajo presión',
  'juego de globo',
  'comunicación de pareja',
] as const

export const DECISION_TAGS = [
  'técnica',
  'táctica',
  'bajo presión',
] as const
