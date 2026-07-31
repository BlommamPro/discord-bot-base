import { REST, Routes } from 'discord.js';
import { config } from '../../config/config.js';
import { loadCommandsForDeploy, loadContextMenusForDeploy } from '../handlers/commandHandler.js';
import { logger } from './logger.js';

const commands = [];
const contextMenus = [];

const slashCmds = await loadCommandsForDeploy();
slashCmds.forEach(cmd => commands.push(cmd.CMD.toJSON()));

const ctxMenus = await loadContextMenusForDeploy();
ctxMenus.forEach(menu => contextMenus.push(menu.CMD.toJSON()));

const allCommands = [...commands, ...contextMenus];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    logger.info(`Deployando ${allCommands.length} comandos...`);

    const route = config.guildId
      ? Routes.applicationGuildCommands(config.clientId, config.guildId)
      : Routes.applicationCommands(config.clientId);

    const data = await rest.put(route, { body: allCommands });

    logger.success(`✅ ${data.length} comandos deployados correctamente.`);
    logger.info(`Modo: ${config.guildId ? 'Guild (instantáneo)' : 'Global (hasta 1h)'}`);
  } catch (err) {
    logger.error('Error deployando comandos:', err);
  }
})();