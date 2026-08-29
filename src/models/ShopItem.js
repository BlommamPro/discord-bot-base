import mongoose from 'mongoose';

const ShopItemSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 1 },
  roleId: { type: String, default: null },
  stock: { type: Number, default: -1 },
  enabled: { type: Boolean, default: true }
});

ShopItemSchema.index({ guildId: 1, itemId: 1 }, { unique: true });

export const ShopItem = mongoose.model('ShopItem', ShopItemSchema);