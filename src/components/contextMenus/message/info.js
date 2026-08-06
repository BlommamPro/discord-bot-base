import { ContextMenuCommandBuilder, ApplicationCommandType , MessageFlags} from 'discord.js';
import { createEmbed } from '../../../utils/embeds.js';

export default {
  CMD: new ContextMenuCommandBuilder()
    .setName('Info del Mensaje')
    .setType(ApplicationCommandType.Message),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,

  async execute(client, interaction, guildData, userData) {
    const message = interaction.targetMessage;

    const embed = createEmbed({
      title: '📨 Información del Mensaje',
      fields: [
        { name: 'Autor', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: 'Canal', value: `<#${message.channelId}>`, inline: true },
        { name: 'Fecha', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Contenido', value: message.content || '*(Sin contenido)*' }
      ]
    });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};