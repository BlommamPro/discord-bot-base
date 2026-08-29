import { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import { rerollGiveaway } from '../../utils/giveawayHandler.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Elige un nuevo ganador de un sorteo terminado')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(opt =>
      opt.setName('id')
         .setDescription('ID del sorteo')
         .setRequired(true)
    ),

  PERMISSIONS: ['ManageEvents'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const id = interaction.options.getString('id').toUpperCase();
    const winner = await rerollGiveaway(id, interaction.guildId);

    if (!winner) {
      return interaction.reply({ 
        embeds: [errorEmbed('No encontré ese sorteo terminado en este servidor.')], flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({
      embeds: [successEmbed(`🎉 Nuevo ganador: <@${winner}>!`)],
      content: `<@${winner}>`
    });
  }
};