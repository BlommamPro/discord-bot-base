import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  messages: { type: Number, default: 0 },
  inventory: [{
    itemId: String,
    name: String,
    quantity: { type: Number, default: 1 },
    boughtAt: { type: Date, default: Date.now }
  }],
  cooldowns: {
    type: Map,
    of: Date,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);