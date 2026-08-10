// Emojis personalizados del bot
// Formatos:
// Estático: <:nombre:id>
// Animado:  <a:nombre:id>

export const emojis = {
  // Emojis animados
  a_on: '<a:discordon:1017992953140105316>',
  a_off: '<a:discordoff:1017992958177443850>',
  loading: '<a:loading:1017992953140105318>',
  
  // Emojis estáticos
  check: '<:check:1017992953140105319>',
  cross: '<:cross:1017992953140105320>',
  warning: '<:warning:1017992953140105321>',
  on: '<:activ:1017992963374202971>',
  off: '<:disactiv:1017992954297712662>',
  
  // Emojis de economía
  coin: '<:coin:1017992953140105322>',
  bank: '<:bank:1017992953140105323>',
  
  // Emojis de moderación
  ban: '<:ban:1017992953140105324>',
  kick: '<:kick:1017992953140105325>',
  mute: '<:mute:1017992953140105326>',
  
  // Emojis de niveles
  trophy: '<:trophy:1017992953140105327>',
  star: '<:star:1017992953140105328>',
  
  // Si quieres emojis normales como fallback
  arrow_right: '➡️',
  arrow_left: '⬅️',
  fire: '🔥'
};

// Helper para usar emojis fácilmente
export function e(name) {
  return emojis[name] || '';
}