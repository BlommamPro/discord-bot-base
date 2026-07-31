import { REST, Routes } from 'discord.js';
import { config } from '../../config/config.js';
import { logger } from './logger.js';

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    logger.warn('Borrando comandos antiguos...');

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: [] }
      );
      logger.success(`✅ Comandos de GUILD eliminados (${config.guildId})`);
    }

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: [] }
    );
    logger.success('✅ Comandos GLOBALES eliminados');

    logger.info('Espera 1-5 minutos para que Discord propague los cambios...');
  } catch (err) {
    logger.error('Error borrando comandos:', err);
  }
})();