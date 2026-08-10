import { EmbedBuilder } from 'discord.js';
import { config } from '../../config/config.js';
import { logger } from './logger.js';

let supportChannel = null;

export function setSupportChannel(channel) {
  supportChannel = channel;
}

export async function sendErrorToSupport(type, error, context = '') {
  logger.error(`[ANTICRASH] ${type}:`, error);

  if (!config.supportChannelId || !supportChannel) return;

  const stack = error?.stack || 'Sin stack trace';
  const message = error?.message || String(error);
  const truncatedStack = stack.length > 1500 ? stack.slice(0, 1500) + '...' : stack;

  const embed = new EmbedBuilder()
    .setColor(config.errorColor)
    .setTitle('💥 Error Catastrófico')
    .setDescription(`**Tipo:** \`${type}\``)
    .addFields(
      { name: '📝 Mensaje', value: `\`\`\`${message.slice(0, 1000)}\`\`\`` },
      { name: '📂 Contexto', value: context || 'N/A' },
      { name: '📚 Stack Trace', value: `\`\`\`js\n${truncatedStack}\n\`\`\`` }
    )
    .setTimestamp();

  try {
    await supportChannel.send({ embeds: [embed] });
  } catch (err) {
    logger.error('No pude enviar error al canal de soporte:', err.message);
  }
}

export function setupProcessHandlers(client) {
  process.on('unhandledRejection', (reason, promise) => {
    sendErrorToSupport('unhandledRejection', reason, 'Promesa no manejada - posible bug en dependencia');
  });

  process.on('uncaughtException', async (error) => {
    await sendErrorToSupport('uncaughtException', error, 'Error catastrófico - reiniciando...');
    logger.error('Cerrando proceso por uncaughtException...');
    process.exit(1);
  });

  process.on('warning', (warning) => {
    logger.warn('[NODE WARNING]', warning);
  });

  client.on('error', (error) => {
    sendErrorToSupport('Discord Client Error', error, 'Error de conexión con Discord');
  });

  client.on('warn', (info) => {
    logger.warn('[DISCORD WARN]', info);
  });
}