import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { getShopItem, updateShopItemStock } from '../../utils/shop.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra un item de la tienda')
    .setDMPermission(false)
    .addStringOption(opt =>
      opt.setName('item')
         .setDescription('ID del item a comprar')
         .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad a comprar (por defecto: 1)')
         .setRequired(false)
         .setMinValue(1)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const itemId = interaction.options.getString('item').toLowerCase();
    const quantity = interaction.options.getInteger('cantidad') || 1;

    const cd = await checkDbCooldown(interaction.user.id, 'buy', 0.08);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`Espera un momento antes de comprar de nuevo. <t:${cd.nextTimestamp}:R>.`)],
        ephemeral: true
      });
    }

    const item = await getShopItem(interaction.guildId, itemId);
    if (!item) {
      return interaction.reply({ embeds: [errorEmbed('Ese item no existe en la tienda.')], ephemeral: true });
    }

    const totalPrice = item.price * quantity;

    if ((userData?.balance || 0) < totalPrice) {
      return interaction.reply({
        embeds: [errorEmbed(`No tienes suficientes coins. Necesitas **${totalPrice} coins** y tienes **${userData.balance}**.`)],
        ephemeral: true
      });
    }

    if (item.stock >= 0 && item.stock < quantity) {
      return interaction.reply({
        embeds: [errorEmbed(`No hay suficiente stock. Quedan **${item.stock}** unidades.`)],
        ephemeral: true
      });
    }

    if (item.roleId) {
      const role = interaction.guild.roles.cache.get(item.roleId);
      if (!role) {
        return interaction.reply({ embeds: [errorEmbed('El rol asociado a este item ya no existe.')], ephemeral: true });
      }

      const botMember = interaction.guild.members.me;
      if (!botMember.permissions.has('ManageRoles') || role.position >= botMember.roles.highest.position) {
        return interaction.reply({ embeds: [errorEmbed('No tengo permisos para darte ese rol.')], ephemeral: true });
      }

      // FIX: Usar try/catch real en lugar de .catch() con return
      try {
        await interaction.member.roles.add(role);
      } catch {
        return interaction.reply({ embeds: [errorEmbed('No pude darte el rol.')], ephemeral: true });
      }
    }

    await updateUserData(interaction.user.id, { $inc: { balance: -totalPrice } });

    const inventoryItem = {
      itemId: item.itemId,
      name: item.name,
      quantity,
      boughtAt: new Date()
    };

    const existingIndex = userData.inventory?.findIndex(i => i.itemId === item.itemId);
    if (existingIndex >= 0) {
      await updateUserData(interaction.user.id, {
        $inc: { [`inventory.${existingIndex}.quantity`]: quantity }
      });
    } else {
      await updateUserData(interaction.user.id, {
        $push: { inventory: inventoryItem }
      });
    }

    if (item.stock >= 0) {
      await updateShopItemStock(interaction.guildId, itemId, item.stock - quantity);
    }

    await setDbCooldown(interaction.user.id, 'buy');

    const embed = successEmbed(
      `Compraste **${quantity}x ${item.name}** por **${totalPrice} coins**!` +
      (item.roleId ? `
🎁 Se te ha otorgado el rol <@&${item.roleId}>` : '')
    );
    embed.setTitle('🛒 Compra Exitosa');

    await interaction.reply({ embeds: [embed] });
  }
};