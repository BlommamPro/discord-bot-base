import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';
import { checkRichBadge } from '../../utils/badges.js';

const MIN_REWARD = 30;
const MAX_REWARD = 80;

const JOBS = [
  'lavaste platos en un restaurante',
  'entregaste paquetes',
  'cuidaste mascotas',
  'hiciste diseño gráfico freelance',
  'programaste un bot de Discord',
  'vendiste limonada',
  'reparaste computadoras',
  'tradujiste documentos',
  'hiciste streaming',
  'cultivaste tomates'
];

export default {
  CMD: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja para ganar coins')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const cd = await checkDbCooldown(interaction.user.id, 'work', 30);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`Ya trabajaste recientemente. Vuelve <t:${cd.nextTimestamp}:R>.`)],
        flags: MessageFlags.Ephemeral
      });
    }

    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];

    await updateUserData(interaction.user.id, { $inc: { balance: reward } });
    await setDbCooldown(interaction.user.id, 'work');
    await checkRichBadge(interaction.user.id, client);

    const embed = successEmbed(`Trabajaste como **${job}** y ganaste **${reward} coins**!`);
    embed.setTitle('💼 Trabajo Completado');

    await interaction.reply({ embeds: [embed] });
  }
};