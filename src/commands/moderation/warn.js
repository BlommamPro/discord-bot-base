import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { addWarn, getWarnCount, checkAutoAction } from '../../utils/warns.js';
import { addModLog } from '../../utils/modlog.js';

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
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario.')], flags: MessageFlags.Ephemeral });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnerte a ti mismo.')], flags: MessageFlags.Ephemeral });
    }

    if (target.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnearme a mí.')], flags: MessageFlags.Ephemeral });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes warnear a alguien con un rol igual o superior al tuyo.')], flags: MessageFlags.Ephemeral });
    }

    if (!target.moderatable) {
      return interaction.reply({ embeds: [errorEmbed('No puedo moderar a ese usuario.')], flags: MessageFlags.Ephemeral });
    }

    // FIX: Guardar el documento Warn para obtener su _id
    const warnDoc = await addWarn(interaction.guildId, target.id, interaction.user.id, reason);
    const warnCount = await getWarnCount(interaction.guildId, target.id);
    
    // FIX: Pasar el warnId al modlog para que /modlog muestre la ID usable con /unwarn
    await addModLog(interaction.guildId, target.id, interaction.user.id, 'warn', reason, null, warnDoc._id.toString());

    const autoAction = await checkAutoAction(interaction.guild, target, warnCount);

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