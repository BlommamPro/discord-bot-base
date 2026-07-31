import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

const DAILY_REWARD = 100;
const STREAK_BONUS = 50;

export default {
  CMD: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama tu recompensa diaria de coins')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const cd = await checkDbCooldown(interaction.user.id, 'daily', 24 * 60);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`Ya reclamaste tu daily. Vuelve <t:${cd.nextTimestamp}:R>.`)],
        ephemeral: true
      });
    }

    const now = new Date();
    let newStreak = 1;

    if (userData.lastDaily) {
      const last = new Date(userData.lastDaily);
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours >= 24 && diffHours < 48) {
        newStreak = userData.dailyStreak + 1;
      }
    }

    const streakBonus = (newStreak > 1) ? STREAK_BONUS * (newStreak - 1) : 0;
    const totalReward = DAILY_REWARD + streakBonus;

    await updateUserData(interaction.user.id, {
      username: interaction.user.username,
      $inc: { balance: totalReward },
      dailyStreak: newStreak,
      lastDaily: now
    });
    await setDbCooldown(interaction.user.id, 'daily');

    const nextDaily = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextTimestamp = Math.floor(nextDaily.getTime() / 1000);

    const embed = successEmbed(
      `Reclamaste **${totalReward} coins**!` +
      (newStreak > 1 ? `
🔥 Racha de **${newStreak} días**! (+${streakBonus} bonus)` : '')
    );
    embed.setFooter({ text: `Vuelve a reclamar <t:${nextTimestamp}:R>` });

    await interaction.reply({ embeds: [embed] });
  }
};