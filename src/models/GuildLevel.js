import mongoose from 'mongoose';

const GuildLevelSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  messages: { type: Number, default: 0 }
});

GuildLevelSchema.index({ guildId: 1, userId: 1 }, { unique: true });
GuildLevelSchema.index({ guildId: 1, xp: -1 });

export const GuildLevel = mongoose.model('GuildLevel', GuildLevelSchema);