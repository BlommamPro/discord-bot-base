import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';
import { getUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Muestra tu inventario de items comprados')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a ver (opcional)')
         .setRequired(false)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const cd = await checkDbCooldown(interaction.user.id, 'inventory', 0.05);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`Espera un momento antes de revisar tu inventario. <t:${cd.nextTimestamp}:R>.`)], flags: MessageFlags.Ephemeral });
    }

    const target = interaction.options.getUser('usuario') || interaction.user;
    const data = await getUserData(target.id, target.username);

    if (!data.inventory || data.inventory.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed(`${target.username} no tiene items en su inventario.`)], flags: MessageFlags.Ephemeral });
    }

    const items = data.inventory.map(item =>
      '**' + item.name + '** (`' + item.itemId + '`) — x' + item.quantity
    ).join('\n');

    const embed = createEmbed({
      title: '🎒 Inventario de ' + target.username,
      description: items,
      footer: { text: 'Balance: ' + data.balance + ' coins' }
    });

    await setDbCooldown(interaction.user.id, 'inventory');
    await interaction.reply({ embeds: [embed] });
  }
};