import { Collection } from 'discord.js';

const cooldowns = new Collection();

export function checkCooldown(client, name, userId, cooldownSeconds = 3) {
  if (!cooldowns.has(name)) {
    cooldowns.set(name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(name);
  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      return { onCooldown: true, timeLeft };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return { onCooldown: false };
}