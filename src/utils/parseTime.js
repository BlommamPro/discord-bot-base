/**
 * Parsea strings de tiempo como "1h30m", "7d", "5s", "2d12h"
 * Soporta: s (segundos), m (minutos), h (horas), d (días), w (semanas)
 * 
 * @param {string} input - Ej: "1h30m", "7d", "5s"
 * @returns {{ms: number, text: string} | null}
 */
export function parseTime(input) {
  if (!input || typeof input !== 'string') return null;

  const regex = /(\d+)\s*([smhdw])/gi;
  const matches = [...input.matchAll(regex)];

  if (matches.length === 0) return null;

  let totalMs = 0;

  const multipliers = {
    s: 1000,           // segundos
    m: 60 * 1000,      // minutos
    h: 60 * 60 * 1000, // horas
    d: 24 * 60 * 60 * 1000,  // días
    w: 7 * 24 * 60 * 60 * 1000 // semanas
  };

  for (const match of matches) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (value <= 0 || !multipliers[unit]) continue;
    totalMs += value * multipliers[unit];
  }

  if (totalMs <= 0) return null;

  // Generar texto legible
  const seconds = Math.floor(totalMs / 1000);
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  let textParts = [];
  if (days > 0) textParts.push(`${days}d`);
  if (hours % 24 > 0) textParts.push(`${hours % 24}h`);
  if (mins % 60 > 0) textParts.push(`${mins % 60}m`);
  if (seconds % 60 > 0) textParts.push(`${seconds % 60}s`);

  return {
    ms: totalMs,
    text: textParts.join(' ') || '0s'
  };
}

/**
 * Límites comunes de Discord
 */
export const TIME_LIMITS = {
  timeout: 28 * 24 * 60 * 60 * 1000,  // 28 días (límite de Discord)
  ban: 365 * 24 * 60 * 60 * 1000       // 1 año (para bans temporales)
};