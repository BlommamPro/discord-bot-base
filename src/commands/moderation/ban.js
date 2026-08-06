import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor')
    .setDMPermission(false)
    .addUserOption(opt => 
      opt.setName('usuario').setDescription('Usuario a banear').setRequired(true)
    )
    .addStringOption(opt => 
      opt.setName('razon').setDescription('Razón del ban').setRequired(false)
    ),

  PERMISSIONS: ['BanMembers'],
  BOT_PERMISSIONS: ['BanMembers'],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,
  NSFW: false,

  async execute(client, interaction, guildData, userData) {
    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No especificada';

    if (user.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes banearte a ti mismo')], ephemeral: true });
    }

    if (user.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes banearme a mí')], ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario en el servidor')], ephemeral: true });
    }

    // FIX: Verificar jerarquía de roles
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes banear a alguien con un rol igual o superior al tuyo.')], ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ embeds: [errorEmbed('No tengo permisos para banear a ese usuario')], ephemeral: true });
    }

    await member.ban({ reason: `${interaction.user.tag}: ${reason}` });

    const embed = successEmbed(`**${user.tag}** ha sido baneado.\n📝 Razón: \`${reason}\``);
    await interaction.reply({ embeds: [embed] });
  }
};