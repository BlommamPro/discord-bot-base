import { logger } from '../../utils/logger.js';

export default {
  name: 'warn',
  once: false,

  execute(client, info) {
    logger.warn('Advertencia del cliente Discord:', info);
  }
};