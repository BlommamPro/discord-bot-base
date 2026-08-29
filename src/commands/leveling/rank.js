import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { createProgressBar, formatPercentage } from '../../utils/embedDecorations.js';
import { getGuildLevel, getXpForLevel } from '../../utils/levelSystem.js';
import { getUserData } from '../../utils/guildData.js';

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
      const progressBar = createProgressBar(data.xp, xpNeeded, 20);
      const percentage = formatPercentage(data.xp, xpNeeded);

      const embed = createEmbed({
        color: COLORS.LEVELING,
        title: `🌍 Rango Global de ${target.username}`,
        thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
        description: [
          `⭐ **Nivel:** ${data.level}`,
          `✨ **XP:** ${data.xp} / ${xpNeeded}`,
          `📈 **Progreso:** \`${progressBar}\` ${percentage}%`,
          `💬 **Mensajes:** ${data.messages}`,
          `💰 **Dinero:** ${data.balance} coins`
        ].join('\n'),
        footer: {
          text: `Solicitado por ${interaction.user.username}`,
          icon: interaction.user.displayAvatarURL()
        }
      });

      return interaction.reply({ embeds: [embed] });
    }

    const data = await getGuildLevel(interaction.guildId, target.id);
    const xpNeeded = getXpForLevel(data.level);
    const progressBar = createProgressBar(data.xp, xpNeeded, 20);
    const percentage = formatPercentage(data.xp, xpNeeded);

    const embed = createEmbed({
      color: COLORS.LEVELING,
      title: `🏠 Rango de ${target.username} en ${interaction.guild.name}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      description: [
        `⭐ **Nivel:** ${data.level}`,
        `✨ **XP:** ${data.xp} / ${xpNeeded}`,
        `📈 **Progreso:** \`${progressBar}\` ${percentage}%`,
        `💬 **Mensajes:** ${data.messages}`
      ].join('\n'),
      footer: {
        text: `Solicitado por ${interaction.user.username}`,
        icon: interaction.user.displayAvatarURL()
      }
    });

    await interaction.reply({ embeds: [embed] });
  }
};