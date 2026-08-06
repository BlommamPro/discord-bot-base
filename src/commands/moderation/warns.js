import { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} from 'discord.js';
import { createEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { getUserWarns, clearUserWarns, removeWarn } from '../../utils/warns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Gestiona las advertencias de un usuario')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a consultar')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('accion')
         .setDescription('Acción a realizar')
         .setRequired(false)
         .addChoices(
           { name: 'Ver warns', value: 'view' },
           { name: 'Borrar última warn', value: 'remove_last' },
           { name: 'Borrar todas', value: 'clear' }
         )
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario');
    const action = interaction.options.getString('accion') || 'view';

    if (action === 'view') {
      const warns = await getUserWarns(interaction.guildId, target.id);

      if (warns.length === 0) {
        return interaction.reply({ embeds: [createEmbed({ title: '✅ Limpio', description: `${target} no tiene advertencias.` })] });
      }

      const fields = warns.map((w, i) => ({
        name: `Warn #${i + 1} — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`,
        value: [
          `**Razón:** ${w.reason}`,
          `**Moderador:** <@${w.moderatorId}>`,
          `**ID:** \`${w._id}\``
        ].join('\n'),
        inline: false
      }));

      const embed = createEmbed({
        title: `⚠️ Advertencias de ${target.username} (${warns.length})`,
        fields
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (action === 'remove_last') {
      const warns = await getUserWarns(interaction.guildId, target.id);
      if (warns.length === 0) {
        return interaction.reply({ embeds: [errorEmbed('Este usuario no tiene warns.')], flags: MessageFlags.Ephemeral });
      }

      await removeWarn(warns[0]._id);
      return interaction.reply({ embeds: [successEmbed(`Última warn de ${target} eliminada. Quedan ${warns.length - 1}.`)] });
    }

    if (action === 'clear') {
      await clearUserWarns(interaction.guildId, target.id);
      return interaction.reply({ embeds: [successEmbed(`Todas las warns de ${target} han sido eliminadas.`)] });
    }
  }
};