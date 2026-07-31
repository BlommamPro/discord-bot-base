import { REST, Routes } from 'discord.js';
import { config } from '../../config/config.js';
import { logger } from './logger.js';

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    const global = await rest.get(Routes.applicationCommands(config.clientId));
    logger.info(`Comandos GLOBALES (${global.length}):`);
    global.forEach(c => console.log(`  /${c.name} - ${c.description}`));

    if (config.guildId) {
      const guild = await rest.get(
        Routes.applicationGuildCommands(config.clientId, config.guildId)
      );
      logger.info(`Comandos GUILD (${guild.length}):`);
      guild.forEach(c => console.log(`  /${c.name} - ${c.description}`));
    }
  } catch (err) {
    logger.error('Error listando comandos:', err);
  }
})();