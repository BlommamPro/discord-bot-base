import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { addModLog } from '../../utils/modlog.js';

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
      return interaction.reply({ embeds: [errorEmbed('No puedes banearte a ti mismo')], flags: MessageFlags.Ephemeral });
    }

    if (user.id === client.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes banearme a mí')], flags: MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('No pude encontrar a ese usuario en el servidor')], flags: MessageFlags.Ephemeral });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('No puedes banear a alguien con un rol igual o superior al tuyo.')], flags: MessageFlags.Ephemeral });
    }

    if (!member.bannable) {
      return interaction.reply({ embeds: [errorEmbed('No tengo permisos para banear a ese usuario')], flags: MessageFlags.Ephemeral });
    }

    await member.ban({ reason: `${interaction.user.tag}: ${reason}` });
    await addModLog(interaction.guildId, user.id, interaction.user.id, 'ban', reason);

    const embed = successEmbed(`**${user.tag}** ha sido baneado.\n📝 Razón: \`${reason}\``);
    await interaction.reply({ embeds: [embed] });
  }
};