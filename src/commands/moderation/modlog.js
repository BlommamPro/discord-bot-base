import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';
import { getModLog } from '../../utils/modlog.js';

const ACTION_EMOJIS = {
  ban: '🔨', unban: '🔓', kick: '👢', timeout: '🔇',
  untimeout: '🔊', warn: '⚠️', unwarn: '🗑️', clear: '🧹'
};

const ACTION_NAMES = {
  ban: 'Ban', unban: 'Unban', kick: 'Kick', timeout: 'Timeout',
  untimeout: 'Untimeout', warn: 'Warn', unwarn: 'Unwarn', clear: 'Clear'
};

export default {
  CMD: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('Historial de acciones de moderación de un usuario')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a consultar')
         .setRequired(true)
    ),

  PERMISSIONS: ['ModerateMembers'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario');

    const logs = await getModLog(interaction.guildId, target.id, 50);

    if (logs.length === 0) {
      return interaction.reply({ 
        embeds: [createEmbed({ title: '✅ Limpio', description: `${target} no tiene historial de moderación.` })] 
      });
    }

    const fields = logs.slice(0, 25).map(entry => {
      const emoji = ACTION_EMOJIS[entry.action] || '📋';
      const name = ACTION_NAMES[entry.action] || entry.action;
      const time = `<t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>`;
      const mod = `<@${entry.moderatorId}>`;
      const displayId = entry.warnId ? entry.warnId : entry._id.toString();
      
      let value = `**Mod:** ${mod} | **Razón:** ${entry.reason}`;
      if (entry.duration) value += ` | **Duración:** ${entry.duration}`;
      value += ` | **ID:** \`${displayId}\``;

      return { name: `${emoji} ${name} — ${time}`, value, inline: false };
    });

    const embed = createEmbed({
      title: `📋 Historial de Moderación — ${target.username} (${logs.length})`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      fields
    });

    await interaction.reply({ embeds: [embed] });
  }
};