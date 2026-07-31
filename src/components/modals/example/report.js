import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { successEmbed } from '../../../utils/embeds.js';

/**
 * Este modal maneja customIds como:
 * - example-report
 * - example-report-{userId}
 */

export default {
  customId: 'example-report',

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 60,

  async execute(client, interaction, args, guildData, userData) {
    // args[0] sería el userId si el customId era example-report-{userId}
    const reportedUserId = args[0];

    const reason = interaction.fields.getTextInputValue('reason');
    const details = interaction.fields.getTextInputValue('details');

    // Aquí podrías guardar en la DB o enviar a un canal de logs
    console.log(`Reporte: ${reportedUserId || 'General'} - ${reason} - ${details}`);

    await interaction.reply({ 
      embeds: [successEmbed('Reporte enviado correctamente. Gracias por tu colaboración.')], 
      ephemeral: true 
    });
  }
};

// ===== FUNCIÓN AUXILIAR PARA MOSTRAR EL MODAL =====
// Úsala en un comando o botón así:
/*
const modal = new ModalBuilder()
  .setCustomId(`example-report-{${interaction.user.id}}`)
  .setTitle('Reportar Usuario');

const reasonInput = new TextInputBuilder()
  .setCustomId('reason')
  .setLabel('Razón del reporte')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const detailsInput = new TextInputBuilder()
  .setCustomId('details')
  .setLabel('Detalles adicionales')
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(false);

modal.addComponents(
  new ActionRowBuilder().addComponents(reasonInput),
  new ActionRowBuilder().addComponents(detailsInput)
);

await interaction.showModal(modal);
*/