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