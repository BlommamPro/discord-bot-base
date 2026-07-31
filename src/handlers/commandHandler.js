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

/**
 * Extrae la categoría desde la ruta del archivo.
 * Ej: src/commands/economy/balance.js → "economy"
 * Ej: src/commands/general/ping.js → "general"
 */
function getCategoryFromPath(filePath, basePath) {
  const rel = relative(basePath, filePath).replace(/\\/g, '/');
  const folder = rel.split('/')[0];
  return folder || 'general';
}

// ===== CARGAR COMANDOS EN EL CLIENTE =====
export async function loadCommands(client) {
  const slashPath = join(__dirname, '../commands');
  const files = await loadFiles(slashPath);

  for (const file of files) {
    const { default: cmd } = await import('file://' + file);
    if (!cmd || !cmd.CMD) continue;

    // Detectar categoría automáticamente por carpeta
    const autoCategory = getCategoryFromPath(file, slashPath);
    cmd.CATEGORY = cmd.CATEGORY || autoCategory;

    const name = cmd.CMD.name;
    client.slashCommands.set(name, cmd);
  }
  logger.success(`${client.slashCommands.size} slash commands cargados`);
}

// ===== CARGAR PARA DEPLOY =====
export async function loadCommandsForDeploy() {
  const slashPath = join(__dirname, '../commands');
  const files = await loadFiles(slashPath);
  const commands = [];

  for (const file of files) {
    const { default: cmd } = await import('file://' + file);
    if (cmd?.CMD) {
      cmd.CATEGORY = cmd.CATEGORY || getCategoryFromPath(file, slashPath);
      commands.push(cmd);
    }
  }
  return commands;
}

export async function loadContextMenusForDeploy() {
  const ctxPath = join(__dirname, '../components/contextMenus');
  const files = await loadFiles(ctxPath);
  const menus = [];

  for (const file of files) {
    const { default: menu } = await import('file://' + file);
    if (menu?.CMD) menus.push(menu);
  }
  return menus;
}