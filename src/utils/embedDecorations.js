export const SEPARATORS = {
  LINE: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬',
  DOUBLE: '═══════════════════════════════════════',
  DOT: '• • • • • • • • • • • • • • • • • • • • • •',
  STAR: '⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐',
  WAVE: '〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜',
  DASH: '───────────────────────────────────────',
};

export function createProgressBar(current, max, length = 20, filledChar = '█', emptyChar = '░') {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.round(percentage * length);
  const empty = length - filled;
  return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

export function formatPercentage(current, max) {
  return Math.round((Math.min(Math.max(current / max, 0), 1)) * 100);
}

export function createSection(title, content) {
  return `**${title}**\n${content}\n${SEPARATORS.LINE}`;
}

export function createBulletList(items, bullet = '•') {
  return items.map(item => `${bullet} ${item}`).join('\n');
}

export function formatTime(timestamp) {
  return `<t:${Math.floor(timestamp / 1000)}:F>`;
}

export function formatRelativeTime(timestamp) {
  return `<t:${Math.floor(timestamp / 1000)}:R>`;
}