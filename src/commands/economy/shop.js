import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';
import { getShopItems } from '../../utils/shop.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Muestra la tienda del servidor')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const items = await getShopItems(interaction.guildId);

    if (items.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('La tienda de este servidor está vacía. Los admins pueden usar `/shopconfig` para añadir items.')], flags: MessageFlags.Ephemeral });
    }
    
    const itemsText = items.map((item, i) => {
      const stockText = item.stock >= 0 ? `| 📦 ${item.stock}` : '| ∞';
      const roleText = item.roleId ? `| 🎁 <@&${item.roleId}>` : '';
      return `**${i + 1}.** ${item.name} — 💰 ${item.price} ${stockText} ${roleText}\n\`ID: ${item.itemId}\`${item.description ? `\n*${item.description}*` : ''}`;
    }).join('\n\n');

    const embed = createEmbed({
      title: `🛒 Tienda de ${interaction.guild.name}`,
      description: [
        `💰 Tu balance: **${userData?.balance || 0} coins**`,
        ``,
        itemsText
      ].join('\n')
    });

    await interaction.reply({ embeds: [embed] });
  }
};