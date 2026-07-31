import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra la latencia del bot')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: false,
  NSFW: false,

  async execute(client, interaction, guildData, userData) {
    const sent = await interaction.reply({ content: '🏓 Calculando...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    const embed = createEmbed({
      title: '🏓 Pong!',
      description: [
        `📡 **API:** \`${client.ws.ping}ms\``,
        `⏱️ **Latencia:** \`${latency}ms\``
      ].join('\n')
    });

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};