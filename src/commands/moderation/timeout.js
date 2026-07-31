import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { parseTime, TIME_LIMITS } from '../../utils/parseTime.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Silencia temporalmente a un usuario')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a silenciar')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('tiempo')
         .setDescription('Duración: 1h30m, 7d, 5m, 30s, 2d12h...')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
         .setDescription('Razón del timeout')
         .setRequired(false)
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: ['ModerateMembers'],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getMember('usuario');
    const timeInput = interaction.options.getString('tiempo');
    const reason = interaction.options.getString('razon') || 'Sin razón';

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes darte timeout a ti mismo.')], ephemeral: true });
    }

    if (target.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes darme timeout a mí.')], ephemeral: true });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes dar timeout a alguien con un rol igual o superior al tuyo.')], ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({ embeds: [errorEmbed('No puedo moderar a ese usuario. Puede que tenga un rol superior al mío.')], ephemeral: true });
    }

    // Parsear tiempo
    const parsed = parseTime(timeInput);
    if (!parsed) {
      return interaction.reply({
        embeds: [errorEmbed('Formato de tiempo inválido. Usa: `1h30m`, `7d`, `5m`, `30s`, `2d12h`...')],
        ephemeral: true
      });
    }

    // Límite de Discord: 28 días
    if (parsed.ms > TIME_LIMITS.timeout) {
      const maxText = parseTime('28d').text;
      return interaction.reply({
        embeds: [errorEmbed(`El timeout máximo es **${maxText}** (límite de Discord).`)],
        ephemeral: true
      });
    }

    if (target.communicationDisabledUntilTimestamp && target.communicationDisabledUntilTimestamp > Date.now()) {
      return interaction.reply({ embeds: [errorEmbed('Ese usuario ya tiene un timeout activo.')], ephemeral: true });
    }

    try {
      await target.timeout(parsed.ms, `${interaction.user.tag}: ${reason}`);

      const embed = successEmbed(
        `**Usuario:** ${target}\n` +
        `**Duración:** ${parsed.text}\n` +
        `**Razón:** ${reason}`
      );
      embed.setTitle('🔇 Timeout Aplicado');

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed(`No pude dar timeout: ${err.message}`)], ephemeral: true });
    }
  }
};