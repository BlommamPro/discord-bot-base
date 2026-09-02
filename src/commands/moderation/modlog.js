import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed, COLORS } from '../../utils/embeds.js';
import { getModLog } from '../../utils/modlog.js';
import { Warn } from '../../models/Warn.js';

const ACTION_EMOJIS = {
  ban: '🔨', 
  unban: '🔓', 
  kick: '👢', 
  timeout: '🔇',
  untimeout: '🔊', 
  warn: '⚠️', 
  unwarn: '🗑️', 
  clear: '🧹'
};

const ACTION_NAMES = {
  ban: 'Ban', 
  unban: 'Unban', 
  kick: 'Kick', 
  timeout: 'Timeout',
  untimeout: 'Untimeout', 
  warn: 'Warn', 
  unwarn: 'Unwarn', 
  clear: 'Clear'
};

export default {
  CMD: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('📋 Historial de acciones de moderación de un usuario')
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
        embeds: [createEmbed({ 
          color: COLORS.SUCCESS,
          title: '✅ Limpio', 
          description: `${target} no tiene historial de moderación.` 
        })] 
      });
    }

    const activeWarns = await Warn.find({ 
      guildId: interaction.guildId, 
      userId: target.id 
    }).select('_id');

    const activeWarnIds = new Set(activeWarns.map(w => w._id.toString()));

    const fields = logs.slice(0, 25).map(entry => {
      const emoji = ACTION_EMOJIS[entry.action] || '📋';
      const name = ACTION_NAMES[entry.action] || entry.action;
      const time = `<t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>`;
      const mod = `<@${entry.moderatorId}>`;
      
      let status = '';
      let statusEmoji = '';

      if (entry.action === 'warn') {
        const warnId = entry.warnId || entry._id.toString();
        const isActive = activeWarnIds.has(warnId);
        
        if (isActive) {
          status = 'Activa';
          statusEmoji = '🟢';
        } else {
          status = 'Eliminada';
          statusEmoji = '🔴';
        }
      } else if (['ban', 'kick', 'timeout'].includes(entry.action)) {
        status = 'Aplicada';
        statusEmoji = '✅';
      } else if (['unban', 'untimeout', 'unwarn', 'clear'].includes(entry.action)) {
        status = 'Deshecha';
        statusEmoji = '↩️';
      } else {
        status = 'Registrada';
        statusEmoji = '📌';
      }
      
      let value = `**Mod:** ${mod} | **Razón:** ${entry.reason}`;
      
      if (entry.duration) {
        value += ` | **Duración:** ${entry.duration}`;
      }
      
      const displayId = entry.warnId ? entry.warnId : entry._id.toString();
      value += ` | **ID:** \`${displayId}\``;
      
      if (entry.action === 'warn') {
        value += ` | **Estado:** ${statusEmoji} ${status}`;
      }

      return { 
        name: `${emoji} ${name} — ${time}`, 
        value: value, 
        inline: false 
      };
    });

    const activeWarnCount = activeWarns.length;

    const embed = createEmbed({
      color: COLORS.INFO,
      title: `📋 Historial de Moderación — ${target.username} (${logs.length})`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      description: [
        `👤 **Usuario:** ${target.tag} (\`${target.id}\`)`,
        `📊 **Warns activos:** ${activeWarnCount}`,
        '',
        `📝 **Últimas ${Math.min(logs.length, 25)} acciones:**`
      ].join('\n'),
      fields: fields,
      footer: {
        text: `Solicitado por ${interaction.user.username}`,
        icon: interaction.user.displayAvatarURL()
      }
    });

    await interaction.reply({ embeds: [embed] });
  }
};