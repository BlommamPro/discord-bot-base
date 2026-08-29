export const emojis = {
  // Emojis animados
  a_on: '<a:discordon:1017992953140105316>',
  a_off: '<a:discordoff:1017992958177443850>',
  load: '<a:loadinge:1537944714291191829>',
  pingconnetion: '<a:connexionping:1537953051514634382>',
  timersand: '<a:timersand:1538366544462086154>',
  
  // Emojis estáticos
  check: '<:check:1537882869203210270>',
  cross: '<:croix:1537881873106079805>',
  warning: '<:warningicon:1017992956407468083>',
  on: '<:activ:1017992963374202971>',
  off: '<:disactiv:1017992954297712662>',
  infor: '<:info:1537883147696611448>',
  locker: '<:fermer:1537883384259543170>',
  unlocker: '<:ouvert:1537881531178029057>',
  clear: '<:supprimer:1537881754612924548>',
  
  // Emojis de economía
  coin: '<:coin:1537886245240176720>',
  bank: '<:bank:1537948797781409823>',
  
  // Emojis de moderación
  ban: '<:cybersecurite:1537882166183198821>',
  mute: '<:mute:1537881450131755109>'
};

// Helper para usar emojis fácilmente
export function e(name) {
  return emojis[name] || '';
}