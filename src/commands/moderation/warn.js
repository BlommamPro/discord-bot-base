import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { addWarn, getWarnCount, checkAutoAction } from '../../utils/warns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a warnear')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
         .setDescription('Razón de la advertencia')
         .setRequired(false)
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: ['ModerateMembers'],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('razon') || 'Sin razón';

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnerte a ti mismo.')], ephemeral: true });
    }

    if (target.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnearme a mí.')], ephemeral: true });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnear a alguien con un rol igual o superior al tuyo.')], ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({ embeds: [errorEmbed('No puedo moderar a ese usuario.')], ephemeral: true });
    }

    // Crear la warn en DB
    await addWarn(interaction.guildId, target.id, interaction.user.id, reason);
    const warnCount = await getWarnCount(interaction.guildId, target.id);

    // Verificar acciones automáticas
    const autoAction = await checkAutoAction(interaction.guild, target, warnCount);

    // Enviar DM al usuario (si está disponible)
    try {
      const dmEmbed = createEmbed({
        title: `⚠️ Has sido advertido en ${interaction.guild.name}`,
        description: [
          `**Razón:** ${reason}`,
          `**Moderador:** ${interaction.user.tag}`,
          `**Warns totales:** ${warnCount}`
        ].join('\n')
      });
      await target.send({ embeds: [dmEmbed] });
    } catch { /* DM cerrado */ }

    // Construir respuesta
    let description = `**Usuario:** ${target}\n**Razón:** ${reason}\n**Warns totales:** ${warnCount}`;

    if (autoAction) {
      if (autoAction.success) {
        description += `\n\n🚨 **Acción automática ejecutada:** ${autoAction.action.toUpperCase()}`;
      } else {
        description += `\n\n⚠️ **Acción automática fallida (${autoAction.action}):** ${autoAction.error}`;
      }
    }

    const embed = successEmbed(description);
    embed.setTitle('⚠️ Usuario Advertido');

    await interaction.reply({ embeds: [embed] });
  }
};