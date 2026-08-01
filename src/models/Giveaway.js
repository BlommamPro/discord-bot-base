import mongoose from 'mongoose';

const GiveawaySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  hostId: { type: String, required: true },
  prize: { type: String, required: true },
  winnerCount: { type: Number, default: 1 },
  endTime: { type: Date, required: true },
  entries: { type: [String], default: [] },
  requirements: {
    roleId: { type: String, default: null },
    minDays: { type: Number, default: 0 }
  },
  ended: { type: Boolean, default: false },
  winners: { type: [String], default: [] }
});

GiveawaySchema.index({ guildId: 1, ended: 1 });
GiveawaySchema.index({ endTime: 1 });

export const Giveaway = mongoose.model('Giveaway', GiveawaySchema);