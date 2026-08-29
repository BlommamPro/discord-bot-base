import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
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

function getCustomIdFromPath(filePath, type) {
  const cleanPath = filePath.replace(/\.js$/, '');
  const parts = cleanPath.split(/[\\/]/);
  const typeIndex = parts.findIndex(p =>
    p === 'buttons' || p === 'selectMenus' || p === 'modals' || p === 'contextMenus'
  );
  if (typeIndex === -1) return null;
  const relevantParts = parts.slice(typeIndex + 1);
  return relevantParts.join('-');
}

export async function loadComponents(client) {
  const btnPath = join(__dirname, '../components/buttons');
  const btnFiles = await loadFiles(btnPath);
  for (const file of btnFiles) {
    const { default: btn } = await import('file://' + file);
    if (!btn) continue;
    const customId = btn.customId || getCustomIdFromPath(file, 'buttons');
    if (customId) client.buttons.set(customId, { ...btn, customId });
  }
  logger.success(`${client.buttons.size} buttons cargados`);

  const smPath = join(__dirname, '../components/selectMenus');
  const smFiles = await loadFiles(smPath);
  for (const file of smFiles) {
    const { default: sm } = await import('file://' + file);
    if (!sm) continue;
    const customId = sm.customId || getCustomIdFromPath(file, 'selectMenus');
    if (customId) client.selectMenus.set(customId, { ...sm, customId });
  }
  logger.success(`${client.selectMenus.size} select menus cargados`);

  const modalPath = join(__dirname, '../components/modals');
  const modalFiles = await loadFiles(modalPath);
  for (const file of modalFiles) {
    const { default: modal } = await import('file://' + file);
    if (!modal) continue;
    const customId = modal.customId || getCustomIdFromPath(file, 'modals');
    if (customId) client.modals.set(customId, { ...modal, customId });
  }
  logger.success(`${client.modals.size} modals cargados`);

  const ctxPath = join(__dirname, '../components/contextMenus');
  const ctxFiles = await loadFiles(ctxPath);
  for (const file of ctxFiles) {
    const { default: ctx } = await import('file://' + file);
    if (!ctx || !ctx.CMD) continue;
    client.contextMenus.set(ctx.CMD.name, ctx);
  }
  logger.success(`${client.contextMenus.size} context menus cargados`);
}