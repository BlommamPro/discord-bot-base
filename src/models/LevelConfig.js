import mongoose from 'mongoose';

const LevelConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  roles: [{
    level: { type: Number, required: true },
    roleId: { type: String, required: true }
  }],
  announceChannel: { type: String, default: null },
  levelUpMessage: { 
    type: String, 
    default: '🎉 ¡{user} ha subido al nivel **{level}**!' 
  },
  ignoredChannels: { type: [String], default: [] },
  xpMin: { type: Number, default: 15 },
  xpMax: { type: Number, default: 25 },
  cooldownSeconds: { type: Number, default: 60 }
});

export const LevelConfig = mongoose.model('LevelConfig', LevelConfigSchema);