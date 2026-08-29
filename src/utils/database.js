import mongoose from 'mongoose';
import { config } from '../../config/config.js';
import { logger } from './logger.js';

export async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoURL);
    logger.db('Conectado a MongoDB');
  } catch (err) {
    logger.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.db('Desconectado de MongoDB');
  } catch (err) {
    logger.error('Error al desconectar de MongoDB:', err.message);
  }
}

export function setupDBShutdown() {
  process.on('SIGINT', async () => {
    logger.warn('Recibida señal SIGINT, cerrando conexión...');
    await disconnectDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.warn('Recibida señal SIGTERM, cerrando conexión...');
    await disconnectDB();
    process.exit(0);
  });
}