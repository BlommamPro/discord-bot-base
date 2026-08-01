import { ActivityType } from 'discord.js';
import { config } from '../../../config/config.js';
import { logger } from '../../utils/logger.js';
import { startGiveawayChecker } from '../../utils/giveawayHandler.js';

export default {
  name: 'ready',
  once: true,

  execute(client) {
    const activityType = ActivityType[config.activity.type] || ActivityType.Playing;

    client.user.setPresence({
      activities: [{ name: config.activity.name, type: activityType }],
      status: config.status
    });

    logger.success(`${client.user.tag} está online en ${client.guilds.cache.size} servidores`);
    logger.info(`📊 ${client.users.cache.size} usuarios | ${client.channels.cache.size} canales`);

    // Iniciar revisión automática de giveaways cada 30 segundos
    startGiveawayChecker(client);
  }
};