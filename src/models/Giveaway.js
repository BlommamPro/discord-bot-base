import mongoose from 'mongoose';

const GiveawaySchema = new mongoose.Schema({
  giveawayId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  prize: { type: String, required: true },
  winnerCount: { type: Number, default: 1 },
  endTime: { type: Date, required: true },
  hostedBy: { type: String, default: '' },        // Nombre del host
  hostedById: { type: String, default: '' },      // ID del host
  requiredRoleId: { type: String, default: null },
  participants: { type: [String], default: [] },
  winners: { type: [String], default: [] },
  ended: { type: Boolean, default: false }
});

export const Giveaway = mongoose.model('Giveaway', GiveawaySchema);