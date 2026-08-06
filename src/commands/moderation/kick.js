// src/commands/moderation/kick.js
import { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a expulsar')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
         .setDescription('Razón de la expulsión')
         .setRequired(false)
    ),

  PERMISSIONS: ['KickMembers'],
  BOT_PERMISSIONS: ['KickMembers'],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('razon') || 'Sin razón';

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario.')], flags: MessageFlags.Ephemeral });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes expulsarte a ti mismo.')], flags: MessageFlags.Ephemeral });
    }

    if (target.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes expulsarme a mí.')], flags: MessageFlags.Ephemeral });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes expulsar a alguien con un rol igual o superior al tuyo.')], flags: MessageFlags.Ephemeral });
    }

    if (!target.kickable) {
      return interaction.reply({ embeds: [errorEmbed('No puedo expulsar a ese usuario. Puede que tenga un rol superior al mío.')], flags: MessageFlags.Ephemeral });
    }

    try {
      await target.kick(`${interaction.user.tag}: ${reason}`);

      const embed = successEmbed(
        `**Usuario:** ${target.user.tag} (${target.id})\n` +
        `**Razón:** ${reason}`
      );
      embed.setTitle('👢 Usuario Expulsado');

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed(`No pude expulsar: ${err.message}`)], flags: MessageFlags.Ephemeral });
    }
  }
};