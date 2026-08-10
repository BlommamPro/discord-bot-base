import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('testerror')
    .setDescription('Genera un error a proposito para probar el anticrash (SOLO OWNER)')
    .setDMPermission(true)
    .addStringOption(opt =>
      opt.setName('tipo')
         .setDescription('Tipo de error a generar')
         .setRequired(true)
         .addChoices(
           { name: '💥 Error en comando (el bot sigue)', value: 'command' },
           { name: '❌ Error catastrófico (reinicia bot)', value: 'fatal' }
         )
    ),

  OWNER: true,
  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  COOLDOWN: 0,

  async execute(client, interaction, guildData, userData) {
    const tipo = interaction.options.getString('tipo');

    if (tipo === 'command') {
      // Este error es capturado por interactionCreate.js, el bot sigue
      await interaction.reply({ content: '💥 Generando error de comando...', flags: MessageFlags.Ephemeral });
      throw new Error('Error de prueba dentro de un comando');
    }

    if (tipo === 'fatal') {
      // Este error escapa todo y reinicia el bot (simula un bug grave)
      await interaction.reply({ content: '💥 Generando error catastrófico en 2 segundos...', flags: MessageFlags.Ephemeral });
      setTimeout(() => {
        throw new Error('Error catastrófico de prueba');
      }, 2000);
    }
  }
};