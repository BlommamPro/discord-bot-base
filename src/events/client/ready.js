import { ActivityType } from 'discord.js';
import { config } from '../../../config/config.js';
import { logger } from '../../utils/logger.js';

export default {
  name: 'ready',
  once: true,
  
  execute(client) {
    const activityType = ActivityType[config.activity.type] || ActivityType.Playing;
    
    client.user.setPresence({
      activities: [{ name: config.activity.name, type: activityType }],
      status: config.status
    });

    logger.success(`${client.user.tag} está online`);
    logger.info(`📊 ${client.guilds.cache.size} servidores | ${client.users.cache.size} usuarios`);
  }
};