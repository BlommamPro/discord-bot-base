import mongoose from 'mongoose';

const ShopItemSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  itemId: { type: String, required: true },      // ID único del item (ej: "vip-role")
  name: { type: String, required: true },         // Nombre visible
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 1 },
  roleId: { type: String, default: null },        // Si comprar da un rol
  stock: { type: Number, default: -1 },           // -1 = ilimitado
  enabled: { type: Boolean, default: true }
});

// Índice compuesto para no repetir itemId en el mismo guild
ShopItemSchema.index({ guildId: 1, itemId: 1 }, { unique: true });

export const ShopItem = mongoose.model('ShopItem', ShopItemSchema);