import { ModLog } from '../models/ModLog.js';

export async function addModLog(guildId, userId, moderatorId, action, reason = 'Sin razón', duration = null, warnId = null) {
  return await ModLog.create({ guildId, userId, moderatorId, action, reason, duration, warnId });
}

export async function getModLog(guildId, userId, limit = 50) {
  return await ModLog.find({ guildId, userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function getGuildModLog(guildId, limit = 50) {
  return await ModLog.find({ guildId }).sort({ createdAt: -1 }).limit(limit);
}