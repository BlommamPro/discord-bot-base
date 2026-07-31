import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { User } from '../../models/User.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top 10 usuarios con más nivel')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 10,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    // Obtener top 10 por nivel y XP
    const topUsers = await User.find()
      .sort({ level: -1, xp: -1 })
      .limit(10);

    if (topUsers.length === 0) {
      return interaction.reply({ content: 'No hay datos todavía.', ephemeral: true });
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const description = topUsers.map((u, i) => {
      const medal = medals[i] || '🔹';
      return `${medal} <@${u.userId}> — Nivel **${u.level}** | XP: \`${u.xp}\` | 💰 \`${u.balance}\``;
    }).join('\n');

    const embed = createEmbed({
      title: '🏆 Tabla de Clasificación',
      description
    });

    await interaction.reply({ embeds: [embed] });
  }
};