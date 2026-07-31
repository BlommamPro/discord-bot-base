/**
 * Parsea un customId con formato dinámico
 * Ej: "ticket-create-{123}" con patrón "ticket-create" → args: ["123"]
 */
export function parseCustomId(customId, pattern) {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = escapedPattern.replace(/\\{\\}/g, '(.+?)');
  const regex = new RegExp(`^${regexPattern}$`);
  const match = customId.match(regex);

  if (!match) return null;
  return match.slice(1);
}