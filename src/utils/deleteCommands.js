import { REST, Routes } from 'discord.js';
import { config } from '../../config/config.js';
import { logger } from './logger.js';

setTimeout(() => {
  logger.warn('Forzando cierre del delete por timeout de seguridad...');
  process.exit(0);
}, 30000);

(async () => {
  try {
    const rest = new REST({ version: '10', timeout: 10000, retries: 2 }).setToken(config.token);
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
    process.exit(0);
  } catch (err) {
    logger.error('Error borrando comandos:', err.message || err);
    process.exit(1);
  }
})();