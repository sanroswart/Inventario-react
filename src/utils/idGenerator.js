/*
 Genera un código alfanumérico de longitud 6 con un prefijo.
 */
export function generateCode(prefix) {
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}
