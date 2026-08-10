import { logger } from '../../utils/logger.js';
import { sendErrorToSupport } from '../../utils/anticrash.js';

export default {
  name: 'error',
  once: false,

  execute(client, error) {
    logger.error('Error del cliente Discord:', error);
    sendErrorToSupport('Discord Client Error', error, 'Evento error del cliente');
  }
};