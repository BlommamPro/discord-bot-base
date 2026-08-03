// src/commands/admin/levelconfig.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { LevelConfig } from '../../models/LevelConfig.js';
import { GuildLevel } from '../../models/GuildLevel.js';
import { emojis } from '../../utils/emojis.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('levelconfig')
    .setDescription('Configura el sistema de niveles del servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('toggle')
         .setDescription('Activar o desactivar niveles')
         .addBooleanOption(opt => opt.setName('activar').setDescription('On/Off').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('role')
         .setDescription('Dar un rol al subir de nivel')
         .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel requerido').setRequired(true).setMinValue(1))
         .addRoleOption(opt => opt.setName('rol').setDescription('Rol a dar').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('removerole')
         .setDescription('Quitar rol de un nivel')
         .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('channel')
         .setDescription('Canal de anuncios de nivel')
         .addChannelOption(opt => opt.setName('canal').setDescription('Canal').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset')
         .setDescription('Reiniciar niveles de un usuario o todos')
         .addUserOption(opt => opt.setName('usuario').setDescription('Usuario (dejar vacío para TODOS)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('view')
         .setDescription('Ver configuración actual')
    ),

  PERMISSIONS: ['Administrator'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (sub === 'toggle') {
      const enable = interaction.options.getBoolean('activar');
      await LevelConfig.findOneAndUpdate(
        { guildId },
        { enabled: enable },
        { upsert: true, new: true }
      );
      return interaction.reply({ 
        embeds: [successEmbed(`Sistema de niveles: ${enable ? `${emojis.animate_on} Activado` : `${emojis.animate_off} Desactivado`}`)] 
      });
    }

    if (sub === 'role') {
      const level = interaction.options.getInteger('nivel');
      const role = interaction.options.getRole('rol');

      // FIX: usar array "roles" en lugar de objeto "levelRoles"
      await LevelConfig.findOneAndUpdate(
        { guildId },
        { $pull: { roles: { level } } },  // quitar si ya existe
        { upsert: true }
      );
      await LevelConfig.findOneAndUpdate(
        { guildId },
        { $push: { roles: { level, roleId: role.id } } },
        { upsert: true, new: true }
      );

      return interaction.reply({ 
        embeds: [successEmbed(`Al llegar al nivel ${level} se dará el rol ${role}.`)] 
      });
    }

    if (sub === 'removerole') {
      const level = interaction.options.getInteger('nivel');
      
      // FIX: usar $pull en array "roles"
      await LevelConfig.findOneAndUpdate(
        { guildId },
        { $pull: { roles: { level } } }
      );
      return interaction.reply({ embeds: [successEmbed(`Rol del nivel ${level} eliminado.`)] });
    }

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('canal');
      await LevelConfig.findOneAndUpdate(
        { guildId },
        { announceChannel: channel.id },
        { upsert: true }
      );
      return interaction.reply({ embeds: [successEmbed(`Canal de niveles: ${channel}`)] });
    }

    if (sub === 'reset') {
      const target = interaction.options.getUser('usuario');

      if (target) {
        await GuildLevel.findOneAndUpdate(
          { guildId, userId: target.id },
          { xp: 0, level: 1 },
          { upsert: true }
        );
        return interaction.reply({ embeds: [successEmbed(`Nivel de ${target} reiniciado.`)] });
      } else {
        await GuildLevel.deleteMany({ guildId });
        return interaction.reply({ embeds: [successEmbed('Todos los niveles del servidor han sido reiniciados.')] });
      }
    }

    if (sub === 'view') {
      const config = await LevelConfig.findOne({ guildId });
      
      // FIX: leer desde array "roles"
      const rolesText = config?.roles?.length
        ? config.roles.map(r => `Nivel ${r.level}: <@&${r.roleId}>`).join('\n')
        : 'Ninguno';

      const embed = createEmbed({
        title: '⚙️ Config de Niveles',
        fields: [
          { name: 'Estado', value: config?.enabled ? '✅ Activado' : '❌ Desactivado', inline: true },
          { name: 'Canal', value: config?.announceChannel ? `<#${config.announceChannel}>` : 'No configurado', inline: true },
          { name: 'Roles por nivel', value: rolesText || 'Ninguno' }
        ]
      });
      return interaction.reply({ embeds: [embed] });
    }
  }
};