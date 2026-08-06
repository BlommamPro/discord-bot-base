import { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} from 'discord.js';
import { createEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { Giveaway } from '../../models/Giveaway.js';
import { parseTime } from '../../utils/parseTime.js';

function generateGiveawayId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Crea un sorteo en el servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(opt =>
      opt.setName('premio')
         .setDescription('Qué se sortea')
         .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('duracion')
         .setDescription('Duración: 1h, 1d, 30m, etc.')
         .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('ganadores')
         .setDescription('Cantidad de ganadores')
         .setRequired(false)
         .setMinValue(1)
         .setMaxValue(10)
    )
    .addRoleOption(opt =>
      opt.setName('rol_requerido')
         .setDescription('Solo usuarios con este rol pueden participar')
         .setRequired(false)
    ),

  PERMISSIONS: ['ManageEvents'],
  BOT_PERMISSIONS: ['AddReactions', 'EmbedLinks'],
  OWNER: false,
  COOLDOWN: 10,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const prize = interaction.options.getString('premio');
    const durationStr = interaction.options.getString('duracion');
    const winnerCount = interaction.options.getInteger('ganadores') || 1;
    const requiredRole = interaction.options.getRole('rol_requerido');

    const parsed = parseTime(durationStr);
    if (!parsed) {
      return interaction.reply({
        embeds: [errorEmbed('Formato de tiempo inválido. Usa: `1h`, `30m`, `1d`, `2d12h`...')], flags: MessageFlags.Ephemeral });
    }

    const endTime = Date.now() + parsed.ms;
    const giveawayId = generateGiveawayId();

    const embed = createEmbed({
      title: '🎉 Nuevo Sorteo',
      description: [
        `**Premio:** ${prize}`,
        `**Ganadores:** ${winnerCount}`,
        `**Termina:** <t:${Math.floor(endTime / 1000)}:R>`,
        `**Participantes:** 0`,
        ``,
        `Reacciona con 🎉 para participar`
      ].join('\n'),
      footer: { text: `ID: ${giveawayId} • Creado por ${interaction.user.tag}` }
    });

    const msg = await interaction.channel.send({ embeds: [embed] });
    await msg.react('🎉');

    await Giveaway.create({
      giveawayId,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      messageId: msg.id,
      prize,
      winnerCount,
      endTime: new Date(endTime),
      hostedBy: interaction.user.tag,
      hostedById: interaction.user.id,
      requiredRoleId: requiredRole?.id || null,
      participants: [],
      winners: [],
      ended: false
    });

    await interaction.reply({
      embeds: [successEmbed(`Sorteo creado con ID \`${giveawayId}\`. Termina ${parsed.text}.`)], flags: MessageFlags.Ephemeral });
  }
};