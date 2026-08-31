import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { getGuildData } from '../../utils/guildData.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('📊 Muestra información detallada del servidor')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const guild = interaction.guild;
    
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = totalMembers - botCount;
    
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.isTextBased()).size;
    const voiceChannels = channels.filter(c => c.isVoiceBased()).size;
    const categories = channels.filter(c => c.type === 4).size;
    
    const roles = guild.roles.cache;
    const emojis = guild.emojis.cache;
    const stickers = guild.stickers.cache;

    const verificationLevels = {
      NONE: 'Ninguno',
      LOW: 'Bajo',
      MEDIUM: 'Medio',
      HIGH: 'Alto',
      VERY_HIGH: 'Muy Alto'
    };

    const embed = createEmbed({
      color: COLORS.GENERAL,
      title: `📊 ${guild.name}`,
      thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
      description: [
        `🆔 **ID:** \`${guild.id}\``,
        `👑 **Dueño:** <@${guild.ownerId}>`,
        `📅 **Creado:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
        `📅 **Bot unido:** <t:${Math.floor(guild.joinedTimestamp / 1000)}:R>`,
        '',
        `**👥 Miembros**`,
        `🔹 **Total:** ${totalMembers}`,
        `🔹 **Humanos:** ${humanCount}`,
        `🔹 **Bots:** ${botCount}`,
        `🔹 **En línea:** ${onlineMembers}`,
        '',
        `**📢 Canales**`,
        `🔹 **Total:** ${channels.size}`,
        `🔹 **Texto:** ${textChannels}`,
        `🔹 **Voz:** ${voiceChannels}`,
        `🔹 **Categorías:** ${categories}`,
        '',
        `**⚙️ Configuración**`,
        `🔹 **Roles:** ${roles.size}`,
        `🔹 **Emojis:** ${emojis.size}`,
        `🔹 **Stickers:** ${stickers.size}`,
        `🔹 **Verificación:** ${verificationLevels[guild.verificationLevel] || 'Desconocido'}`
      ].join('\n'),
      footer: {
        text: `Solicitado por ${interaction.user.username}`,
        icon: interaction.user.displayAvatarURL()
      }
    });

    await interaction.reply({ embeds: [embed] });
  }
};