import { User } from '../models/User.js';

export const BADGE_DEFINITIONS = {
  early_bird: { emoji: '🌅', name: 'Early Bird', desc: 'Primer daily reclamado' },
  rich: { emoji: '💰', name: 'Millonario', desc: 'Llegar a 10,000 coins' },
  streak_7: { emoji: '🔥', name: 'Streak Master', desc: '7 días de daily seguidos' },
  streak_30: { emoji: '🔥', name: 'Streak Legend', desc: '30 días de daily seguidos' },
  crime_lord: { emoji: '👮', name: 'Crime Lord', desc: '50 crímenes exitosos' },
  jackpot: { emoji: '🎰', name: 'Jackpot', desc: 'Ganar 777 en slots' },
  level_10: { emoji: '⭐', name: 'Veterano', desc: 'Llegar a nivel 10 global' },
  level_50: { emoji: '👑', name: 'Leyenda', desc: 'Llegar a nivel 50 global' },
  shopaholic: { emoji: '🛒', name: 'Shopaholic', desc: 'Comprar 10 items en la tienda' },
  married: { emoji: '💍', name: 'Casado', desc: 'Usar /marry' }
};

export async function checkAndAwardBadge(userId, badgeId, client = null) {
  const user = await User.findOne({ userId });
  if (!user || user.badges.includes(badgeId)) return false;

  await User.updateOne(
    { userId },
    { $push: { badges: badgeId } }
  );

  if (client) {
    const badge = BADGE_DEFINITIONS[badgeId];
    if (badge) {
      try {
        const discordUser = await client.users.fetch(userId);
        await discordUser.send({
          content: `${badge.emoji} **¡Nueva insignia desbloqueada: ${badge.name}!**\n*${badge.desc}*`
        });
      } catch { /* DM cerrado, ignorar */ }
    }
  }

  return true;
}

export async function checkRichBadge(userId, client = null) {
  const user = await User.findOne({ userId });
  const totalWealth = (user?.balance || 0) + (user?.bank || 0);
  if (user && totalWealth >= 10000) {
    return await checkAndAwardBadge(userId, 'rich', client);
  }
  return false;
}

export function getBadgeDisplay(badgeId) {
  const b = BADGE_DEFINITIONS[badgeId];
  if (!b) return null;
  return `${b.emoji} **${b.name}** — ${b.desc}`;
}

export function getAllBadgesText(badgeIds) {
  if (!badgeIds || badgeIds.length === 0) return 'Ninguna';
  return badgeIds.map(id => {
    const b = BADGE_DEFINITIONS[id];
    return b ? `${b.emoji}` : `❓`;
  }).join(' ');
}