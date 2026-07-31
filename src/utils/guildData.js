import { Guild } from '../models/Guild.js';

export async function getGuildData(guildId) {
  let data = await Guild.findOne({ guildId });
  
  if (!data) {
    data = await Guild.create({ guildId });
  }
  
  return data;
}

export async function updateGuildData(guildId, update) {
  return await Guild.findOneAndUpdate(
    { guildId },
    update,
    { new: true, upsert: true }
  );
}