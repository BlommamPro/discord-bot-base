import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import { endGiveaway } from '../../utils/giveawayHandler.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('Termina un sorteo manualmente')
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
    
    // ===== FIX: pasar guildId para que solo funcione en este servidor =====
    const result = await endGiveaway(client, id, interaction.guildId);

    if (!result) {
      return interaction.reply({ 
        embeds: [errorEmbed('No encontré ese sorteo activo en este servidor.')], 
        ephemeral: true 
      });
    }

    await interaction.reply({
      embeds: [successEmbed(`Sorteo \`${id}\` finalizado. Ganador(es): ${result.winners.map(w => `<@${w}>`).join(', ') || 'Nadie'}`)]
    });
  }
};