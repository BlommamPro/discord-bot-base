import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { getWarnConfig, updateWarnConfig } from '../../utils/warns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('warnconfig')
    .setDescription('Configura el sistema de warns del servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('view')
         .setDescription('Ver configuración actual')
    )
    .addSubcommand(sub =>
      sub.setName('add')
         .setDescription('Añadir acción automática')
         .addIntegerOption(opt =>
           opt.setName('warns')
              .setDescription('Cantidad de warns para activar')
              .setRequired(true)
              .setMinValue(1)
              .setMaxValue(50)
         )
         .addStringOption(opt =>
           opt.setName('accion')
              .setDescription('Acción a ejecutar')
              .setRequired(true)
              .addChoices(
                { name: 'Kick', value: 'kick' },
                { name: 'Ban', value: 'ban' },
                { name: 'Timeout', value: 'timeout' },
                { name: 'Ninguna', value: 'none' }
              )
         )
         .addIntegerOption(opt =>
           opt.setName('duracion')
              .setDescription('Duración del timeout en minutos (solo para timeout)')
              .setRequired(false)
              .setMinValue(1)
              .setMaxValue(40320) // 28 días máximo
         )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Quitar una acción automática')
         .addIntegerOption(opt =>
           opt.setName('warns')
              .setDescription('Cantidad de warns de la acción a quitar')
              .setRequired(true)
         )
    )
    .addSubcommand(sub =>
      sub.setName('dm')
         .setDescription('Activar/desactivar DM al usuario warnado')
         .addBooleanOption(opt =>
           opt.setName('activar')
              .setDescription('¿Enviar DM?')
              .setRequired(true)
         )
    ),

  PERMISSIONS: ['Administrator'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'view') {
      const config = await getWarnConfig(interaction.guildId);

      const actionsText = config.actions.length
        ? config.actions.map(a => {
            let text = `**${a.warns} warns** → ${a.action.toUpperCase()}`;
            if (a.action === 'timeout' && a.duration) text += ` (${a.duration}min)`;
            return text;
          }).join('\n')
        : 'Sin acciones configuradas.';

      const embed = createEmbed({
        title: '⚙️ Configuración de Warns',
        fields: [
          { name: 'Acciones Automáticas', value: actionsText, inline: false },
          { name: 'Enviar DM', value: config.dmUser ? '✅ Sí' : '❌ No', inline: true },
          { name: 'Max Warns', value: `\`${config.maxWarns}\``, inline: true }
        ]
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'add') {
      const warns = interaction.options.getInteger('warns');
      const action = interaction.options.getString('accion');
      const duration = interaction.options.getInteger('duracion') || 60;

      const config = await getWarnConfig(interaction.guildId);

      // Reemplazar si ya existe para esa cantidad
      const existingIndex = config.actions.findIndex(a => a.warns === warns);
      const newAction = { warns, action, duration: action === 'timeout' ? duration : 0 };

      if (existingIndex >= 0) {
        config.actions[existingIndex] = newAction;
      } else {
        config.actions.push(newAction);
      }

      // Ordenar por cantidad de warns
      config.actions.sort((a, b) => a.warns - b.warns);

      await updateWarnConfig(interaction.guildId, { actions: config.actions });

      let desc = `Cuando un usuario llegue a **${warns} warns**, se ejecutará: **${action.toUpperCase()}**`;
      if (action === 'timeout') desc += ` por **${duration} minutos**`;

      return interaction.reply({ embeds: [successEmbed(desc)] });
    }

    if (sub === 'remove') {
      const warns = interaction.options.getInteger('warns');
      const config = await getWarnConfig(interaction.guildId);

      const before = config.actions.length;
      config.actions = config.actions.filter(a => a.warns !== warns);

      if (config.actions.length === before) {
        return interaction.reply({ embeds: [errorEmbed(`No hay acción configurada para ${warns} warns.`)], ephemeral: true });
      }

      await updateWarnConfig(interaction.guildId, { actions: config.actions });
      return interaction.reply({ embeds: [successEmbed(`Acción para ${warns} warns eliminada.`)] });
    }

    if (sub === 'dm') {
      const enable = interaction.options.getBoolean('activar');
      await updateWarnConfig(interaction.guildId, { dmUser: enable });
      return interaction.reply({ embeds: [successEmbed(`DM al usuario warnado: ${enable ? '✅ Activado' : '❌ Desactivado'}`)] });
    }
  }
};