import { readdir } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadFiles(dir) {
  const files = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const path = join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...await loadFiles(path));
      } else if (item.name.endsWith('.js')) {
        files.push(path);
      }
    }
  } catch { /* directorio no existe */ }
  return files;
}

function getCategoryFromPath(filePath, basePath) {
  const rel = relative(basePath, filePath).replace(/\\/g, '/');
  const folder = rel.split('/')[0];
  return folder || 'general';
}

async function loadAllCommandFiles() {
  const slashPath = join(__dirname, '../commands');
  const files = await loadFiles(slashPath);
  const commands = [];

  for (const file of files) {
    try {
      const { default: cmd } = await import('file://' + file);
      if (cmd?.CMD) {
        cmd.CATEGORY = cmd.CATEGORY || getCategoryFromPath(file, slashPath);
        commands.push(cmd);
      }
    } catch (err) {
      logger.error(`Error cargando comando desde ${file}:`, err.message);
    }
  }
  return commands;
}

export async function loadCommands(client) {
  const commands = await loadAllCommandFiles();
  
  for (const cmd of commands) {
    try {
      const name = cmd.CMD.name;
      client.slashCommands.set(name, cmd);
    } catch (err) {
      logger.error(`Error registrando comando:`, err.message);
    }
  }
  
  logger.success(`${client.slashCommands.size} slash commands cargados`);
}

export async function loadCommandsForDeploy() {
  return await loadAllCommandFiles();
}

export async function loadContextMenusForDeploy() {
  const ctxPath = join(__dirname, '../components/contextMenus');
  const files = await loadFiles(ctxPath);
  const menus = [];

  for (const file of files) {
    try {
      const { default: menu } = await import('file://' + file);
      if (menu?.CMD) menus.push(menu);
    } catch (err) {
      logger.error(`Error cargando context menu desde ${file}:`, err.message);
    }
  }
  return menus;
}