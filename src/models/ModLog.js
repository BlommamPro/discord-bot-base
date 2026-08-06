import mongoose from 'mongoose';

const ModLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  action: { type: String, enum: ['ban', 'unban', 'kick', 'timeout', 'untimeout', 'warn', 'unwarn', 'clear'], required: true },
  reason: { type: String, default: 'Sin razón' },
  duration: { type: String, default: null },
  warnId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

ModLogSchema.index({ guildId: 1, userId: -1 });

export const ModLog = mongoose.model('ModLog', ModLogSchema);