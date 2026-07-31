import { getGuildData } from '../../utils/guildData.js';
import { logger } from '../../utils/logger.js';

export default {
  name: 'guildCreate',
  once: false,

  async execute(client, guild) {
    logger.event(`Bot añadido a: ${guild.name} (${guild.id})`);
    
    // Crear entrada en la base de datos automáticamente
    await getGuildData(guild.id);
    logger.db(`Datos creados para guild: ${guild.id}`);
  }
};