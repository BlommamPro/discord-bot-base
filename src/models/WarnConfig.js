import mongoose from 'mongoose';

const ActionSchema = new mongoose.Schema({
  warns: { type: Number, required: true },  // Ej: 3 warns
  action: { type: String, enum: ['kick', 'ban', 'timeout', 'none'], default: 'none' },
  duration: { type: Number, default: 0 }    // Minutos de timeout (si aplica)
});

const WarnConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  actions: { type: [ActionSchema], default: [] },  // [{warns: 3, action: 'kick'}, {warns: 5, action: 'ban'}]
  maxWarns: { type: Number, default: 10 },         // Límite antes de resetear o ban permanente
  dmUser: { type: Boolean, default: true }         // Enviar DM al usuario warnado
});

export const WarnConfig = mongoose.model('WarnConfig', WarnConfigSchema);