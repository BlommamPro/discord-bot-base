import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { parseTime } from '../../utils/parseTime.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Activa o desactiva el modo lento en un canal')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(opt =>
      opt.setName('tiempo')
         .setDescription('Duración del slowmode (5s, 10s, 1m, 5m, 15m, 30m, 1h, 2h, 6h) o off/desactivar')
         .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName('canal')
         .setDescription('Canal a aplicar (por defecto: canal actual)')
         .addChannelTypes(ChannelType.GuildText)
         .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('razon')
         .setDescription('Razón')
         .setRequired(false)
    ),

  PERMISSIONS: ['ManageChannels'],
  BOT_PERMISSIONS: ['ManageChannels'],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const timeInput = interaction.options.getString('tiempo').toLowerCase().trim();
    const targetChannel = interaction.options.getChannel('canal') || interaction.channel;
    const reason = interaction.options.getString('razon') || 'Sin razón';

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ embeds: [errorEmbed('Solo puedo aplicar slowmode en canales de texto.')], flags: MessageFlags.Ephemeral });
    }

    if (timeInput === 'off' || timeInput === 'desactivar' || timeInput === '0' || timeInput === '0s') {
      await targetChannel.setRateLimitPerUser(0, `${interaction.user.tag}: ${reason}`);
      const embed = successEmbed(`Slowmode desactivado en ${targetChannel}.\n📝 Razón: \`${reason}\``);
      embed.setTitle('🐢 Slowmode Desactivado');
      return interaction.reply({ embeds: [embed] });
    }

    const parsed = parseTime(timeInput);
    if (!parsed) {
      return interaction.reply({
        embeds: [errorEmbed('Formato inválido. Usa: `5s`, `10s`, `30s`, `1m`, `5m`, `15m`, `30m`, `1h`, `2h`, `6h` o `off`')],
        flags: MessageFlags.Ephemeral
      });
    }

    const seconds = Math.floor(parsed.ms / 1000);
    if (seconds > 21600) {
      return interaction.reply({ embeds: [errorEmbed('El slowmode máximo es **6 horas** (límite de Discord).')], flags: MessageFlags.Ephemeral });
    }

    try {
      await targetChannel.setRateLimitPerUser(seconds, `${interaction.user.tag}: ${reason}`);

      const embed = successEmbed(`**Canal:** ${targetChannel}\n**Tiempo:** ${parsed.text}\n**Razón:** ${reason}`);
      embed.setTitle('🐢 Slowmode Activado');

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ embeds: [errorEmbed(`No pude aplicar slowmode: ${err.message}`)], flags: MessageFlags.Ephemeral });
    }
  }
};