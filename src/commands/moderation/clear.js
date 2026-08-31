import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed, clearEmbed } from '../../utils/embeds.js';
import { emojis } from '../../utils/emojis.js';

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

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ embeds: [errorEmbed('Solo puedo borrar mensajes en canales de texto.')], flags: MessageFlags.Ephemeral });
    }

    const botMember = interaction.guild.members.me;
    const botPerms = targetChannel.permissionsFor(botMember);
    if (!botPerms.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ embeds: [errorEmbed('No tengo permiso para borrar mensajes en ese canal.')], flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      let deletedCount = 0;

      if (targetUser) {
        const messages = await targetChannel.messages.fetch({ limit: 100 });
        const userMessages = Array.from(
          messages.filter(m => m.author.id === targetUser.id).values()
        ).slice(0, amount);

        if (userMessages.length === 0) {
          return interaction.editReply({ embeds: [errorEmbed(`No encontré mensajes recientes de ${targetUser} en ${targetChannel}.`)] });
        }

        try {
          const deleted = await targetChannel.bulkDelete(userMessages, true);
          deletedCount = deleted.size;
        } catch {
          for (const msg of userMessages) {
            await msg.delete().catch(() => {});
            deletedCount++;
          }
        }
      } else {
        const deleted = await targetChannel.bulkDelete(amount, true);
        deletedCount = deleted.size;
      }

      const embed = clearEmbed(
        `**Canal:** ${targetChannel}\n` +
        `**Mensajes borrados:** ${deletedCount}` +
        (targetUser ? `\n**Filtrado por:** ${targetUser}` : '')
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Error al borrar: ${err.message}`)] });
    }
  }
};