import { SlashCommandBuilder, ChannelType, MessageFlags } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('📢 Muestra información detallada de un canal')
    .setDMPermission(false)
    .addChannelOption(opt =>
      opt.setName('canal')
         .setDescription('Canal a consultar')
         .setRequired(true)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const channel = interaction.options.getChannel('canal');

    const channelTypes = {
      [ChannelType.GuildText]: '📝 Texto',
      [ChannelType.GuildVoice]: '🔊 Voz',
      [ChannelType.GuildCategory]: '📂 Categoría',
      [ChannelType.GuildAnnouncement]: '📢 Anuncios',
      [ChannelType.AnnouncementThread]: '🧵 Hilo (Anuncios)',
      [ChannelType.PublicThread]: '🧵 Hilo público',
      [ChannelType.PrivateThread]: '🔒 Hilo privado',
      [ChannelType.GuildStageVoice]: '🎭 Escenario',
      [ChannelType.GuildDirectory]: '📁 Directorio',
      [ChannelType.GuildForum]: '📋 Foro'
    };

    const typeName = channelTypes[channel.type] || 'Desconocido';

    let specificInfo = '';
    
    if (channel.isTextBased()) {
      const slowmode = channel.rateLimitPerUser || 0;
      const topic = channel.topic || 'Sin tema';
      const nsfw = channel.nsfw ? '🔞 Sí' : '❌ No';
      
      specificInfo = [
        `**🐢 Modo lento:** ${slowmode > 0 ? `${slowmode}s` : 'Desactivado'}`,
        `**🔞 NSFW:** ${nsfw}`,
        `**📝 Tema:** ${topic.slice(0, 100)}${topic.length > 100 ? '...' : ''}`
      ].join('\n');
    }

    if (channel.isVoiceBased()) {
      const bitrate = channel.bitrate / 1000;
      const userLimit = channel.userLimit || 'Ilimitado';
      
      specificInfo = [
        `**🔊 Bitrate:** ${bitrate} kbps`,
        `**👥 Límite:** ${userLimit} usuarios`
      ].join('\n');
    }

    const botPerms = channel.permissionsFor(interaction.guild.members.me);
    const botCanSend = botPerms?.has('SendMessages') || false;
    const botCanView = botPerms?.has('ViewChannel') || false;

    const embed = createEmbed({
      color: COLORS.GENERAL,
      title: `📢 ${channel.name}`,
      description: [
        `**🆔 ID:** \`${channel.id}\``,
        `**📂 Tipo:** ${typeName}`,
        `**📅 Creado:** <t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
        `**🏠 Categoría:** ${channel.parent ? `<#${channel.parentId}>` : 'Ninguna'}`,
        `**📊 Posición:** \`${channel.position}\``,
        '',
        specificInfo,
        '',
        `**🤖 Permisos del bot**`,
        `🔹 **Ver canal:** ${botCanView ? '✅ Sí' : '❌ No'}`,
        `🔹 **Enviar mensajes:** ${botCanSend ? '✅ Sí' : '❌ No'}`
      ].join('\n'),
      footer: {
        text: `Solicitado por ${interaction.user.username}`,
        icon: interaction.user.displayAvatarURL()
      }
    });

    await interaction.reply({ embeds: [embed] });
  }
};