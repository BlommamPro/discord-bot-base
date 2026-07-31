import { getUserData, updateUserData } from '../../utils/guildData.js';
import { logger } from '../../utils/logger.js';

// XP aleatorio por mensaje (entre 15 y 25)
const MIN_XP = 15;
const MAX_XP = 25;

// Fórmula: nivel ^ 2 * 100 = XP necesario para ese nivel
// Nivel 1 → 100 XP, Nivel 2 → 400 XP, Nivel 3 → 900 XP, etc.
function getXpForLevel(level) {
  return level * level * 100;
}

// Cooldown por usuario para evitar spam de XP (60 segundos)
const xpCooldowns = new Map();

export default {
  name: 'messageCreate',
  once: false,

  async execute(client, message) {
    // Ignorar bots, DM, y mensajes sin guild
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;

    // Cooldown de 60s para ganar XP (anti-spam)
    const now = Date.now();
    if (xpCooldowns.has(userId)) {
      if (now - xpCooldowns.get(userId) < 60000) return;
    }
    xpCooldowns.set(userId, now);

    // Obtener datos del usuario
    const data = await getUserData(userId, message.author.username);

    // XP aleatorio
    const xpGain = Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
    let newXp = data.xp + xpGain;
    let newLevel = data.level;
    let leveledUp = false;

    // Verificar si sube de nivel
    const xpNeeded = getXpForLevel(newLevel);
    if (newXp >= xpNeeded) {
      newLevel++;
      newXp = newXp - xpNeeded; // XP sobrante pasa al siguiente nivel
      leveledUp = true;
    }

    // Guardar en DB
    await updateUserData(userId, {
      username: message.author.username,
      $inc: { messages: 1 },
      xp: newXp,
      level: newLevel
    });

    // Log de subida de nivel (opcional, puedes quitarlo)
    if (leveledUp) {
      logger.success(`${message.author.tag} subió al nivel ${newLevel}!`);
      // Opcional: enviar mensaje en el canal
      // message.channel.send(`🎉 ¡<@${userId}> ha subido al nivel **${newLevel}**!`);
    }
  }
};