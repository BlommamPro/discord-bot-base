import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { getUserData } from '../../utils/guildData.js';

function getXpForLevel(level) {
  return level * level * 100;
}

function generateProgressBar(current, total, length = 15) {
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu progreso de nivel')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a ver (opcional)')
         .setRequired(false)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const data = await getUserData(target.id, target.username);

    const xpNeeded = getXpForLevel(data.level);
    const progressBar = generateProgressBar(data.xp, xpNeeded);
    const percentage = Math.round((data.xp / xpNeeded) * 100);

    const embed = createEmbed({
      title: `📊 Rango de ${target.username}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: '⭐ Nivel', value: `\`${data.level}\``, inline: true },
        { name: '✨ XP Actual', value: `\`${data.xp} / ${xpNeeded}\``, inline: true },
        { name: '📈 Progreso', value: `\`${percentage}%\`\n\`${progressBar}\``, inline: false },
        { name: '💬 Mensajes', value: `\`${data.messages}\``, inline: true },
        { name: '💰 Dinero', value: `\`${data.balance} coins\``, inline: true }
      ]
    });

    await interaction.reply({ embeds: [embed] });
  }
};