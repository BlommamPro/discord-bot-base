import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed, COLORS } from '../../utils/embeds.js';
import { getUserWarns, clearUserWarns, removeWarn, getWarnCount } from '../../utils/warns.js';
import { addModLog } from '../../utils/modlog.js';
import { Warn } from '../../models/Warn.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('⚠️ Gestiona las advertencias de un usuario')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('📋 Ver warns de un usuario')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuario a consultar')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('🗑️ Eliminar una warn específica por ID')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('ID de la warn a eliminar')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('🧹 Eliminar todas las warns de un usuario')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuario a limpiar')
            .setRequired(true)
        )
        .addBooleanOption(opt =>
          opt.setName('confirmar')
            .setDescription('Escribe "true" para confirmar')
            .setRequired(true)
        )
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const target = interaction.options.getUser('usuario');
      const warns = await getUserWarns(interaction.guildId, target.id);

      if (warns.length === 0) {
        return interaction.reply({
          embeds: [createEmbed({
            color: COLORS.SUCCESS,
            title: '✅ Usuario limpio',
            description: `${target} no tiene advertencias.`
          })]
        });
      }

      const fields = warns.map((w, i) => ({
        name: `⚠️ Warn #${i + 1} — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`,
        value: [
          `**Razón:** ${w.reason}`,
          `**Moderador:** <@${w.moderatorId}>`,
          `**ID:** \`${w._id}\``
        ].join('\n'),
        inline: false
      }));

      const embed = createEmbed({
        color: COLORS.MODERATION,
        title: `⚠️ Advertencias de ${target.username}`,
        description: `**Total:** ${warns.length} advertencias`,
        fields: fields,
        thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: {
          text: `Usa /warn remove <id> para eliminar una warn`,
          icon: interaction.user.displayAvatarURL()
        }
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const warnId = interaction.options.getString('id');

      const warn = await Warn.findOne({
        _id: warnId,
        guildId: interaction.guildId
      });

      if (!warn) {
        return interaction.reply({
          embeds: [errorEmbed('❌ No encontré ninguna advertencia con ese ID en este servidor.')],
          flags: MessageFlags.Ephemeral
        });
      }

      const targetId = warn.userId;
      const reason = warn.reason;

      await Warn.findByIdAndDelete(warnId);
      await addModLog(interaction.guildId, targetId, interaction.user.id, 'unwarn', `Eliminada warn ${warnId}: ${reason}`);

      const remaining = await getWarnCount(interaction.guildId, targetId);

      const embed = successEmbed(
        `🗑️ Advertencia **\`${warnId}\`** eliminada.\n` +
        `<@${targetId}> ahora tiene **${remaining}** warn${remaining !== 1 ? 's' : ''}.`
      );
      embed.setTitle('✅ Warn Eliminada');

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'clear') {
      const target = interaction.options.getUser('usuario');
      const confirm = interaction.options.getBoolean('confirmar');

      if (!confirm) {
        return interaction.reply({
          embeds: [errorEmbed('❌ Debes confirmar con `confirmar:true` para eliminar todas las warns.')],
          flags: MessageFlags.Ephemeral
        });
      }

      const warnCount = await getWarnCount(interaction.guildId, target.id);

      if (warnCount === 0) {
        return interaction.reply({
          embeds: [errorEmbed(`❌ ${target} no tiene advertencias.`)],
          flags: MessageFlags.Ephemeral
        });
      }

      await clearUserWarns(interaction.guildId, target.id);
      await addModLog(interaction.guildId, target.id, interaction.user.id, 'clear', `Todas las warns eliminadas (${warnCount})`);

      const embed = successEmbed(
        `🧹 Todas las warns de ${target} han sido eliminadas.\n` +
        `**Warns eliminados:** ${warnCount}`
      );
      embed.setTitle('✅ Warns Eliminadas');

      return interaction.reply({ embeds: [embed] });
    }
  }
};