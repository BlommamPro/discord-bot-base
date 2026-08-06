// src/events/guild/messageCreate.js
import { getGuildData, getUserData, updateUserData } from '../../utils/guildData.js';
import { addGuildXp, getLevelConfig, getXpForLevel } from '../../utils/levelSystem.js';
import { checkAndAwardBadge } from '../../utils/badges.js';
import { logger } from '../../utils/logger.js';

// XP global
const MIN_XP = 15;
const MAX_XP = 25;

// Cooldown anti-spam global
const globalXpCooldowns = new Map();
// Cooldown anti-spam por servidor
const guildXpCooldowns = new Map();

function getXpForGlobalLevel(level) {
  return level * level * 100;
}

export default {
  name: 'messageCreate',
  once: false,

  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const now = Date.now();

    // ===== XP GLOBAL =====
    if (!globalXpCooldowns.has(userId) || now - globalXpCooldowns.get(userId) > 60000) {
      globalXpCooldowns.set(userId, now);

      const userData = await getUserData(userId, message.author.username);
      const xpGain = Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
      let newXp = (userData?.xp || 0) + xpGain;
      let newLevel = userData?.level || 1;
      let leveledUp = false;

      while (newXp >= getXpForGlobalLevel(newLevel)) {
        newXp -= getXpForGlobalLevel(newLevel);
        newLevel++;
        leveledUp = true;
      }

      // FIX: Usar $set para campos planos y $inc para messages en el mismo update
      await updateUserData(userId, {
        $set: {
          username: message.author.username,
          xp: newXp,
          level: newLevel
        },
        $inc: { messages: 1 }
      });

      // Badges globales
      if (newLevel >= 10) await checkAndAwardBadge(userId, 'level_10');
      if (newLevel >= 50) await checkAndAwardBadge(userId, 'level_50');

      if (leveledUp) {
        logger.success(`${message.author.tag} subió al nivel global ${newLevel}!`);
      }
    }

    // ===== XP POR SERVIDOR =====
    const levelConfig = await getLevelConfig(guildId);
    if (levelConfig.enabled) {
      const key = `${guildId}-${userId}`;
      const cooldownMs = (levelConfig.cooldownSeconds || 60) * 1000;

      if (!guildXpCooldowns.has(key) || now - guildXpCooldowns.get(key) > cooldownMs) {
        guildXpCooldowns.set(key, now);

        const xpAmount = Math.floor(
          Math.random() * ((levelConfig.xpMax || 25) - (levelConfig.xpMin || 15) + 1)
        ) + (levelConfig.xpMin || 15);

        const result = await addGuildXp(guildId, userId, xpAmount);

        if (result.leveledUp) {
          const roleConfig = levelConfig.roles?.find(r => r.level === result.newLevel);
          if (roleConfig) {
            const member = message.member;
            if (member && !member.roles.cache.has(roleConfig.roleId)) {
              const role = message.guild.roles.cache.get(roleConfig.roleId);
              if (role && role.position < message.guild.members.me.roles.highest.position) {
                await member.roles.add(role).catch(() => {});
              }
            }
          }

          if (levelConfig.announceChannel) {
            const channel = message.guild.channels.cache.get(levelConfig.announceChannel);
            if (channel?.isTextBased()) {
              channel.send(`🎉 ¡<@${userId}> ha subido al nivel **${result.newLevel}** en este servidor!`)
                .catch(() => {});
            }
          }

          logger.success(`${message.author.tag} subió al nivel ${result.newLevel} en ${message.guild.name}`);
        }
      }
    }
  }
};