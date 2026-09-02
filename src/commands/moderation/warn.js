import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, COLORS } from '../../utils/embeds.js';
import { addWarn, getWarnCount, checkAutoAction, getWarnConfig } from '../../utils/warns.js';
import { addModLog } from '../../utils/modlog.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Advierte a un usuario')
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
      return interaction.reply({
        embeds: [errorEmbed('❌ No pude encontrar a ese usuario.')],
        flags: MessageFlags.Ephemeral
      });
    }
    
    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed('❌ No puedes warnerte a ti mismo.')],
        flags: MessageFlags.Ephemeral
      });
    }

    if (target.id === client.user.id) {
      return interaction.reply({
        embeds: [errorEmbed('❌ No puedes warnearme a mí.')],
        flags: MessageFlags.Ephemeral
      });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        embeds: [errorEmbed('❌ No puedes warnear a alguien con un rol igual o superior al tuyo.')],
        flags: MessageFlags.Ephemeral
      });
    }

    if (!target.moderatable) {
      return interaction.reply({
        embeds: [errorEmbed('❌ No puedo moderar a ese usuario.')],
        flags: MessageFlags.Ephemeral
      });
    }

    const warnDoc = await addWarn(interaction.guildId, target.id, interaction.user.id, reason);
    const warnCount = await getWarnCount(interaction.guildId, target.id);
    await addModLog(interaction.guildId, target.id, interaction.user.id, 'warn', reason, null, warnDoc._id.toString());

    const autoAction = await checkAutoAction(interaction.guild, target, warnCount);
    const warnConfig = await getWarnConfig(interaction.guildId);

    if (warnConfig.dmUser) {
      try {
        const dmEmbed = createEmbed({
          color: COLORS.MODERATION,
          title: `⚠️ Has sido advertido en ${interaction.guild.name}`,
          description: [
            `**Razón:** ${reason}`,
            `**Moderador:** ${interaction.user.tag}`,
            `**Warns totales:** ${warnCount}`
          ].join('\n'),
          footer: {
            text: `ID: ${warnDoc._id.toString().slice(-6)}`,
            icon: interaction.guild.iconURL()
          }
        });
        await target.send({ embeds: [dmEmbed] });
      } catch { /* DM cerrado */ }
    }

    let description = [
      `**Usuario:** ${target}`,
      `**Razón:** ${reason}`,
      `**Warns totales:** ${warnCount}`
    ].join('\n');

    if (autoAction) {
      const actionText = {
        kick: 'expulsado',
        ban: 'baneado',
        timeout: `silenciado por ${autoAction.duration || 'un tiempo'} minutos`
      };

      if (autoAction.success) {
        description += `\n\n🚨 **Acción automática ejecutada:** El usuario ha sido **${actionText[autoAction.action] || autoAction.action}**.`;
      } else {
        description += `\n\n⚠️ **Error al ejecutar acción automática:** ${autoAction.error}`;
      }
    }

    const embed = successEmbed(description);
    embed.setTitle('⚠️ Usuario Advertido');

    await interaction.reply({ embeds: [embed] });
  }
};