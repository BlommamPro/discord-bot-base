import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';
import { getGuildLeaderboard } from '../../utils/levelSystem.js';
import { User } from '../../models/User.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Tabla de clasificación')
    .setDMPermission(false)
    .addStringOption(opt =>
      opt.setName('tipo')
         .setDescription('Qué leaderboard ver')
         .setRequired(false)
         .addChoices(
           { name: '🏠 Niveles del Servidor', value: 'guild_levels' },
           { name: '🌍 Niveles Globales', value: 'global_levels' },
           { name: '💰 Más Ricos', value: 'coins' }
         )
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 10,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const type = interaction.options.getString('tipo') || 'guild_levels';

    if (type === 'guild_levels') {
      const top = await getGuildLeaderboard(interaction.guildId, 10);

      if (top.length === 0) {
        return interaction.reply({ embeds: [errorEmbed('Nadie tiene niveles en este servidor todavía.')], flags: MessageFlags.Ephemeral });
      }

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const description = top.map((u, i) =>
        `${medals[i] || '🔹'} <@${u.userId}> — Nivel **${u.level}** | XP: \`${u.xp}\``
      ).join('\n');

      const embed = createEmbed({
        title: `🏆 Top Niveles — ${interaction.guild.name}`,
        description
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (type === 'global_levels') {
      const top = await User.find().sort({ level: -1, xp: -1 }).limit(10);

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const description = top.map((u, i) =>
        `${medals[i] || '🔹'} <@${u.userId}> — Nivel **${u.level}** | XP: \`${u.xp}\``
      ).join('\n');

      const embed = createEmbed({
        title: '🏆 Top Niveles Globales',
        description
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (type === 'coins') {
      const top = await User.find().sort({ balance: -1 }).limit(10);

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const description = top.map((u, i) =>
        `${medals[i] || '🔹'} <@${u.userId}> — **${u.balance} coins**`
      ).join('\n');

      const embed = createEmbed({
        title: '🏆 Top Más Ricos',
        description
      });

      return interaction.reply({ embeds: [embed] });
    }
  }
};