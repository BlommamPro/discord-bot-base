import mongoose from 'mongoose';

const WarnSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: 'Sin razón' },
  createdAt: { type: Date, default: Date.now }
});

// Índice compuesto para buscar warns por guild + usuario rápido
WarnSchema.index({ guildId: 1, userId: 1 });

export const Warn = mongoose.model('Warn', WarnSchema);