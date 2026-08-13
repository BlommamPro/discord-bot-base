import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { getUserData } from '../../utils/guildData.js';
import { getGuildLevel } from '../../utils/levelSystem.js';
import { getAllBadgesText } from '../../utils/badges.js';
import { getXpForLevel } from '../../utils/levelSystem.js';

function getGlobalXpForLevel(level) {
  return level * level * 100;
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Muestra tu perfil o el de otro usuario')
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

    const guildLevelData = await getGuildLevel(interaction.guildId, target.id);
    const guildXpNeeded = getXpForLevel(guildLevelData.level);
    const guildProgress = Math.round((guildLevelData.xp / guildXpNeeded) * 100);

    const globalXpNeeded = getGlobalXpForLevel(data.level);
    const globalProgress = Math.round((data.xp / globalXpNeeded) * 100);

    const wallet = data?.balance || 0;
    const bank = data?.bank || 0;
    const total = wallet + bank;

    const embed = createEmbed({
      title: `👤 Perfil de ${target.username}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: '💰 En Mano', value: `\`${wallet} coins\``, inline: true },
        { name: '🏦 Banco', value: `\`${bank} coins\``, inline: true },
        { name: '📊 Total', value: `\`${total} coins\``, inline: true },
        { name: '🏠 Nivel Servidor', value: `\`${guildLevelData.level}\` (${guildProgress}%)`, inline: true },
        { name: '🌍 Nivel Global', value: `\`${data.level}\` (${globalProgress}%)`, inline: true },
        { name: '✨ XP Servidor', value: `\`${guildLevelData.xp}/${guildXpNeeded}\``, inline: true },
        { name: '✨ XP Global', value: `\`${data.xp}/${globalXpNeeded}\``, inline: true },
        { name: '💬 Mensajes', value: `\`${data.messages}\``, inline: true },
        { name: '🔥 Racha Diaria', value: `\`${data.dailyStreak} días\``, inline: true },
        { name: '🎖️ Badges', value: getAllBadgesText(data.badges) || 'Ninguna', inline: false },
        { name: '📅 Cuenta creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      ]
    });

    await interaction.reply({ embeds: [embed] });
  }
};