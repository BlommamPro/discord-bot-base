import dotenv from 'dotenv';
dotenv.config();

export const config = {
  token: process.env.BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  mongoURL: process.env.MONGO_URL,
  
  language: process.env.LANGUAGE || 'es',
  color: process.env.COLOR || '#fcc706',
  errorColor: process.env.ERROR_COLOR || '#ED4245',
  cooldownColor: process.env.COOLDOWN_COLOR || '#f3a0fc',
  ownerIds: process.env.OWNER_IDS?.split(' ') || [],
  
  status: process.env.STATUS || 'online',
  activity: {
    type: process.env.ACTIVITY_TYPE || 'Playing',
    name: process.env.ACTIVITY_NAME || 'EstrellaStudios ⭐'
  }
};