import { ShopItem } from '../models/ShopItem.js';

export async function getShopItems(guildId) {
  return await ShopItem.find({ guildId, enabled: true }).sort({ price: 1 });
}

export async function getShopItem(guildId, itemId) {
  return await ShopItem.findOne({ guildId, itemId: itemId.toLowerCase(), enabled: true });
}

export async function createShopItem(guildId, itemId, name, description, price, roleId = null, stock = -1) {
  return await ShopItem.create({
    guildId,
    itemId: itemId.toLowerCase(),
    name,
    description,
    price,
    roleId,
    stock
  });
}

export async function deleteShopItem(guildId, itemId) {
  return await ShopItem.findOneAndDelete({ guildId, itemId: itemId.toLowerCase() });
}

export async function updateShopItemStock(guildId, itemId, newStock) {
  return await ShopItem.findOneAndUpdate(
    { guildId, itemId: itemId.toLowerCase() },
    { stock: newStock },
    { new: true }
  );
}