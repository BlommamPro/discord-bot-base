import { EmbedBuilder } from 'discord.js';
import { config } from '../../config/config.js';

export function createEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || config.color)
    .setTimestamp();

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.footer) embed.setFooter({ text: options.footer.text, iconURL: options.footer.icon });
  else embed.setFooter({ text: 'Discord Bot Base' });

  return embed;
}

export function errorEmbed(description) {
  return createEmbed({ color: config.errorColor, title: '❌ Error', description });
}

export function successEmbed(description) {
  return createEmbed({ color: '#57F287', title: '✅ Éxito', description });
}

export function cooldownEmbed(timeLeft) {
  return createEmbed({ 
    color: config.cooldownColor, 
    title: '⏳ En cooldown', 
    description: `Espera **${timeLeft}** segundos antes de usar esto.` 
  });
}