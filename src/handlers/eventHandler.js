import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadFiles(dir) {
  const files = [];
  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const path = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await loadFiles(path));
    } else if (item.name.endsWith('.js')) {
      files.push(path);
    }
  }
  return files;
}

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const eventFiles = await loadFiles(eventsPath);
  let count = 0;

  for (const file of eventFiles) {
    const { default: event } = await import('file://' + file);
    if (!event || !event.name) continue;

    const handler = (...args) => event.execute(client, ...args);

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }
    count++;
  }
  logger.success(`${count} eventos cargados`);
}