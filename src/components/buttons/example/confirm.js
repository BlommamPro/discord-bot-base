import { successEmbed } from '../../../utils/embeds.js';

/**
 * Este botón maneja customIds como:
 * - example-confirm (coincidencia exacta)
 * - example-confirm-{userId} (coincidencia por patrón)
 * 
 * Para usar con datos dinámicos, crea el botón así:
 * new ButtonBuilder().setCustomId(`example-confirm-{${interaction.user.id}}`)
 */

export default {
  // Si no especificas customId, se infiere de la ruta: example-confirm
  // Pero puedes sobrescribirlo:
  customId: 'example-confirm',

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,

  async execute(client, interaction, args, guildData, userData) {
    // args será ['123456789'] si el customId era example-confirm-{123456789}
    const userId = args[0];

    if (userId && userId !== interaction.user.id) {
      return interaction.reply({ 
        content: 'Este botón no es para ti.', flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ 
      embeds: [successEmbed('¡Acción confirmada correctamente!')], flags: MessageFlags.Ephemeral });
  }
};