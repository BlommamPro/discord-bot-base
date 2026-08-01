import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { getGuildLevel, getXpForLevel } from '../../utils/levelSystem.js';
import { getUserData } from '../../utils/guildData.js';

function generateProgressBar(current, total, length = 15) {
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getGlobalXpForLevel(level) {
  return level * level * 100;
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
    )
    .addStringOption(opt =>
      opt.setName('tipo')
         .setDescription('Ver nivel del servidor o global')
         .setRequired(false)
         .addChoices(
           { name: '🏠 Servidor', value: 'guild' },
           { name: '🌍 Global', value: 'global' }
         )
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const type = interaction.options.getString('tipo') || 'guild';

    if (type === 'global') {
      const data = await getUserData(target.id, target.username);
      const xpNeeded = getGlobalXpForLevel(data.level);
      const progressBar = generateProgressBar(data.xp, xpNeeded);
      const percentage = Math.round((data.xp / xpNeeded) * 100);

      const embed = createEmbed({
        title: `🌍 Rango Global de ${target.username}`,
        thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
        fields: [
          { name: '⭐ Nivel', value: `\`${data.level}\``, inline: true },
          { name: '✨ XP', value: `\`${data.xp} / ${xpNeeded}\``, inline: true },
          { name: '📈 Progreso', value: `\`${percentage}%\`\n\`${progressBar}\``, inline: false },
          { name: '💬 Mensajes', value: `\`${data.messages}\``, inline: true },
          { name: '💰 Dinero', value: `\`${data.balance} coins\``, inline: true }
        ]
      });

      return interaction.reply({ embeds: [embed] });
    }

    // Nivel del servidor
    const data = await getGuildLevel(interaction.guildId, target.id);
    const xpNeeded = getXpForLevel(data.level);
    const progressBar = generateProgressBar(data.xp, xpNeeded);
    const percentage = Math.round((data.xp / xpNeeded) * 100);

    const embed = createEmbed({
      title: `🏠 Rango de ${target.username} en ${interaction.guild.name}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: '⭐ Nivel', value: `\`${data.level}\``, inline: true },
        { name: '✨ XP', value: `\`${data.xp} / ${xpNeeded}\``, inline: true },
        { name: '📈 Progreso', value: `\`${percentage}%\`\n\`${progressBar}\``, inline: false },
        { name: '💬 Mensajes', value: `\`${data.messages}\``, inline: true }
      ]
    });

    await interaction.reply({ embeds: [embed] });
  }
};