import { Warn } from '../models/Warn.js';
import { WarnConfig } from '../models/WarnConfig.js';

export async function addWarn(guildId, userId, moderatorId, reason) {
  return await Warn.create({ guildId, userId, moderatorId, reason });
}

export async function getUserWarns(guildId, userId) {
  return await Warn.find({ guildId, userId }).sort({ createdAt: -1 });
}

export async function getWarnCount(guildId, userId) {
  return await Warn.countDocuments({ guildId, userId });
}

export async function removeWarn(warnId) {
  return await Warn.findByIdAndDelete(warnId);
}

export async function clearUserWarns(guildId, userId) {
  return await Warn.deleteMany({ guildId, userId });
}

export async function getWarnConfig(guildId) {
  let config = await WarnConfig.findOne({ guildId });
  if (!config) {
    config = await WarnConfig.create({ guildId });
  }
  return config;
}

export async function updateWarnConfig(guildId, update) {
  return await WarnConfig.findOneAndUpdate(
    { guildId },
    update,
    { new: true, upsert: true }
  );
}

// Verificar si se debe ejecutar una acción automática
export async function checkAutoAction(guild, member, warnCount) {
  const config = await getWarnConfig(guild.id);
  
  // Buscar si hay una acción configurada para esta cantidad de warns
  const actionRule = config.actions.find(a => a.warns === warnCount);
  if (!actionRule || actionRule.action === 'none') return null;

  const { action, duration } = actionRule;

  try {
    switch (action) {
      case 'kick':
        await member.kick(`Auto-kick: ${warnCount} warns`);
        return { action: 'kick', success: true };

      case 'ban':
        await member.ban({ reason: `Auto-ban: ${warnCount} warns`, deleteMessageDays: 1 });
        return { action: 'ban', success: true };

      case 'timeout':
        await member.timeout(duration * 60 * 1000, `Auto-timeout: ${warnCount} warns`);
        return { action: 'timeout', duration, success: true };

      default:
        return null;
    }
  } catch (err) {
    return { action, success: false, error: err.message };
  }
}