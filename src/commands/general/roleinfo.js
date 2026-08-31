import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('🎭 Muestra información detallada de un rol')
    .setDMPermission(false)
    .addRoleOption(opt =>
      opt.setName('rol')
         .setDescription('Rol a consultar')
         .setRequired(true)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const role = interaction.options.getRole('rol');

    const membersWithRole = interaction.guild.members.cache
      .filter(m => m.roles.cache.has(role.id))
      .map(m => `<@${m.id}>`)
      .join(' ');

    const permMap = {
      Administrator: '👑 Administrador',
      KickMembers: '👢 Expulsar miembros',
      BanMembers: '🔨 Banear miembros',
      ManageChannels: '📢 Gestionar canales',
      ManageGuild: '⚙️ Gestionar servidor',
      ManageMessages: '📝 Gestionar mensajes',
      ManageRoles: '🎭 Gestionar roles',
      ManageNicknames: '✏️ Gestionar apodos',
      ManageEmojisAndStickers: '📎 Gestionar emojis',
      ModerateMembers: '🛡️ Moderar miembros',
      MentionEveryone: '@️⃣ Mencionar @everyone',
      SendMessages: '💬 Enviar mensajes',
      Connect: '🔊 Conectarse a voz',
      Speak: '🗣️ Hablar en voz',
      MoveMembers: '🔄 Mover miembros'
    };

    const perms = role.permissions.toArray();
    const permText = perms
      .filter(p => permMap[p])
      .map(p => permMap[p])
      .join(' • ');

    const embed = createEmbed({
      color: role.color || COLORS.GENERAL,
      title: `🎭 ${role.name}`,
      description: [
        `**🆔 ID:** \`${role.id}\``,
        `**🎨 Color:** \`#${role.color.toString(16).padStart(6, '0')}\``,
        `**📊 Posición:** \`${role.position}\``,
        `**👥 Miembros:** \`${membersWithRole ? role.members.size : 0}\``,
        `**🔹 Mencionable:** ${role.mentionable ? '✅ Sí' : '❌ No'}`,
        `**🔹 Separado:** ${role.hoist ? '✅ Sí' : '❌ No'}`,
        `**🔹 Gestionable:** ${role.editable ? '✅ Sí' : '❌ No'}`,
        `**🔹 Integración:** ${role.managed ? '✅ Sí' : '❌ No'}`,
        '',
        `**🔑 Permisos**`,
        permText || 'Ninguno destacado',
        '',
        `**👥 Miembros con este rol**`,
        membersWithRole.slice(0, 50) || 'Ninguno',
        membersWithRole.length > 50 ? `\n... y ${membersWithRole.length - 50} más` : ''
      ].join('\n'),
      footer: {
        text: `Solicitado por ${interaction.user.username}`,
        icon: interaction.user.displayAvatarURL()
      }
    });

    await interaction.reply({ embeds: [embed] });
  }
};