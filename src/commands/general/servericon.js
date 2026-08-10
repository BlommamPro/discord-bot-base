import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Muestra el icono del servidor')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const guild = interaction.guild;

    if (!guild.icon) {
      return interaction.reply({
        embeds: [errorEmbed('Este servidor no tiene icono.')],
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = createEmbed({
      title: `🖼️ Icono de ${guild.name}`,
      image: { url: guild.iconURL({ size: 4096, dynamic: true }) }
    });

    await interaction.reply({ embeds: [embed] });
  }
};