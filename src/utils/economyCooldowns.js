import { getUserData } from './guildData.js';
import { User } from '../models/User.js';

export async function checkDbCooldown(userId, commandName, cooldownMinutes) {
  const user = await getUserData(userId);
  const lastUsed = user.cooldowns?.get(commandName);

  if (!lastUsed) {
    return { onCooldown: false, timeLeft: 0, nextTimestamp: 0 };
  }

  const lastTime = new Date(lastUsed).getTime();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const nextUse = lastTime + cooldownMs;

  if (Date.now() < nextUse) {
    const timeLeftSec = Math.ceil((nextUse - Date.now()) / 1000);
    return {
      onCooldown: true,
      timeLeft: timeLeftSec,
      nextTimestamp: Math.floor(nextUse / 1000)
    };
  }

  return { onCooldown: false, timeLeft: 0, nextTimestamp: 0 };
}

export async function setDbCooldown(userId, commandName) {
  await User.updateOne(
    { userId },
    { $set: { [`cooldowns.${commandName}`]: new Date() } }
  );
}