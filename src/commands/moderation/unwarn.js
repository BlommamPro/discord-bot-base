import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { Warn } from '../../models/Warn.js';
import { addModLog } from '../../utils/modlog.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Elimina una advertencia por su ID')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addStringOption(opt =>
      opt.setName('id')
         .setDescription('ID de la advertencia a eliminar')
         .setRequired(true)
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const warnId = interaction.options.getString('id');

    const warn = await Warn.findOne({
      _id: warnId,
      guildId: interaction.guildId
    });

    if (!warn) {
      return interaction.reply({
        embeds: [errorEmbed('No encontré ninguna advertencia con ese ID en este servidor.')],
        flags: MessageFlags.Ephemeral
      });
    }

    const targetId = warn.userId;
    const reason = warn.reason;

    await Warn.findByIdAndDelete(warnId);
    await addModLog(interaction.guildId, targetId, interaction.user.id, 'unwarn', `Eliminada warn ${warnId}: ${reason}`);

    const remaining = await Warn.countDocuments({
      guildId: interaction.guildId,
      userId: targetId
    });

    const embed = successEmbed(
      `Advertencia **\`${warnId}\`** eliminada.` +
      `\n<@${targetId}> ahora tiene **${remaining}** warn${remaining !== 1 ? 's' : ''}.` +
      `\n📝 Razón original: *${reason}*`
    );
    embed.setTitle('🗑️ Warn Eliminada');

    await interaction.reply({ embeds: [embed] });
  }
};