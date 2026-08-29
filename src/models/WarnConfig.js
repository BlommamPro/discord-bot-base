import mongoose from 'mongoose';

const ActionSchema = new mongoose.Schema({
  warns: { type: Number, required: true },
  action: { type: String, enum: ['kick', 'ban', 'timeout', 'none'], default: 'none' },
  duration: { type: Number, default: 0 }
});

const WarnConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  actions: { type: [ActionSchema], default: [] },
  maxWarns: { type: Number, default: 10 },
  dmUser: { type: Boolean, default: true }
});

export const WarnConfig = mongoose.model('WarnConfig', WarnConfigSchema);