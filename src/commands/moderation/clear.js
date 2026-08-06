// src/commands/moderation/clear.js
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType , MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Borra mensajes de un canal')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad de mensajes a borrar (1-100)')
         .setRequired(true)
         .setMinValue(1)
         .setMaxValue(100)
    )
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Solo borrar mensajes de este usuario (opcional)')
         .setRequired(false)
    )
    .addChannelOption(opt =>
      opt.setName('canal')
         .setDescription('Canal donde borrar (por defecto: canal actual)')
         .addChannelTypes(ChannelType.GuildText)
         .setRequired(false)
    ),

  PERMISSIONS: ['ManageMessages'],
  BOT_PERMISSIONS: ['ManageMessages'],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const amount = interaction.options.getInteger('cantidad');
    const targetUser = interaction.options.getUser('usuario');
    const targetChannel = interaction.options.getChannel('canal') || interaction.channel;

    // Verificar que sea un canal de texto
    if (!targetChannel.isTextBased()) {
      return interaction.reply({ embeds: [errorEmbed('Solo puedo borrar mensajes en canales de texto.')], flags: MessageFlags.Ephemeral });
    }

    // Verificar permisos del bot en ese canal
    const botMember = interaction.guild.members.me;
    const botPerms = targetChannel.permissionsFor(botMember);
    if (!botPerms.has('ManageMessages')) {
      return interaction.reply({ embeds: [errorEmbed('No tengo permiso para borrar mensajes en ese canal.')], flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      let deletedCount = 0;

      if (targetUser) {
        // Borrar mensajes de un usuario específico
        const messages = await targetChannel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === targetUser.id).first(amount);

        if (userMessages.length === 0) {
          return interaction.editReply({ embeds: [errorEmbed(`No encontré mensajes recientes de ${targetUser} en ${targetChannel}.`)] });
        }

        // bulkDelete no funciona bien con filtrado, así que borramos uno por uno
        for (const msg of userMessages) {
          await msg.delete().catch(() => {});
          deletedCount++;
        }
      } else {
        // Borrar mensajes en general
        const deleted = await targetChannel.bulkDelete(amount, true); // true = filtra mensajes >14 días
        deletedCount = deleted.size;
      }

      const embed = successEmbed(
        `**Canal:** ${targetChannel}\n` +
        `**Mensajes borrados:** ${deletedCount}` +
        (targetUser ? `\n**Filtrado por:** ${targetUser}` : '')
      );
      embed.setTitle('🧹 Mensajes Borrados');

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Error al borrar: ${err.message}`)] });
    }
  }
};