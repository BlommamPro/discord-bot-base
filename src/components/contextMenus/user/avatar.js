import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { createEmbed } from '../../../utils/embeds.js';

export default {
  CMD: new ContextMenuCommandBuilder()
    .setName('Ver Avatar')
    .setType(ApplicationCommandType.User),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.targetUser;

    const embed = createEmbed({
      title: `🖼️ Avatar de ${target.username}`,
      image: { url: target.displayAvatarURL({ size: 4096, dynamic: true }) }
    });

    await interaction.reply({ embeds: [embed] });
  }
};