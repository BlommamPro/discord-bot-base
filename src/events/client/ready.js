import { ActivityType } from 'discord.js';
import { config } from '../../../config/config.js';
import { logger } from '../../utils/logger.js';
import { startGiveawayChecker } from '../../utils/giveawayHandler.js';
import { setSupportChannel } from '../../utils/anticrash.js';
import { setSupportChannelForErrors } from '../../events/interaction/interactionCreate.js';

export default {
  name: 'clientReady',
  once: true,

  async execute(client) {
    const activityType = ActivityType[config.activity.type] || ActivityType.Playing;

    client.user.setPresence({
      activities: [{ name: config.activity.name, type: activityType }],
      status: config.status
    });

    logger.success(`${client.user.tag} está online en ${client.guilds.cache.size} servidores`);
    logger.info(`📊 ${client.users.cache.size} usuarios | ${client.channels.cache.size} canales`);

    startGiveawayChecker(client);

    if (config.supportChannelId) {
      try {
        const channel = await client.channels.fetch(config.supportChannelId);
        if (channel) {
          setSupportChannel(channel);
          setSupportChannelForErrors(channel);
          logger.success(`Canal de soporte configurado: #${channel.name}`);
        }
      } catch (err) {
        logger.warn('No pude obtener el canal de soporte:', err.message);
      }
    }
  }
};