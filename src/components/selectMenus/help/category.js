import { createEmbed } from '../../../utils/embeds.js';

const CATEGORY_NAMES = {
  general: '🌐 General',
  moderation: '🛡️ Moderación',
  administration: '⚙️ Administración',
  fun: '🎉 Diversión',
  economy: '💰 Economía',
  music: '🎵 Música',
  utility: '🛠️ Utilidad',
  owner: '👑 Dueño',
  nsfw: '🔞 NSFW',
  tickets: '🎫 Tickets',
  giveaways: '🎁 Sorteos',
  leveling: '⭐ Niveles',
  welcome: '👋 Bienvenida',
  logs: '📋 Logs'
};

export default {
  customId: 'help-category',

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,

  async execute(client, interaction, args, guildData, userData) {
    await interaction.deferUpdate();

    const selectedCategory = interaction.values[0];

    // Buscar comandos de la categoría seleccionada (detectada por carpeta)
    const commands = [];
    for (const [name, cmd] of client.slashCommands) {
      const cat = (cmd.CATEGORY || 'general').toLowerCase();
      if (cat === selectedCategory) {
        commands.push(`\`/${cmd.CMD.name}\` — ${cmd.CMD.description}`);
      }
    }

    commands.sort();

    const displayName = CATEGORY_NAMES[selectedCategory]
      || `📁 ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`;

    const embed = createEmbed({
      title: `${displayName}`,
      description: commands.length
        ? commands.join('\n')
        : 'No hay comandos en esta categoría.'
    });

    await interaction.editReply({ embeds: [embed] });
  }
};