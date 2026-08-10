import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/embeds.js';
import { getGuildData, updateGuildData } from '../../utils/guildData.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configura los ajustes del servidor (SOLO OWNER)')
    .setDMPermission(false)
    .addSubcommand(sub =>
      sub.setName('view')
         .setDescription('Ver configuración actual')
    )
    .addSubcommand(sub =>
      sub.setName('prefix')
         .setDescription('Cambiar el prefijo del servidor')
         .addStringOption(opt =>
           opt.setName('nuevo')
              .setDescription('Nuevo prefijo')
              .setRequired(true)
              .setMinLength(1)
              .setMaxLength(5)
         )
    )
    .addSubcommand(sub =>
      sub.setName('welcome')
         .setDescription('Canal de bienvenidas')
         .addChannelOption(opt =>
           opt.setName('canal')
              .setDescription('Canal de bienvenidas')
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true)
         )
    )
    .addSubcommand(sub =>
      sub.setName('language')
         .setDescription('Idioma del servidor')
         .addStringOption(opt =>
           opt.setName('idioma')
              .setDescription('Idioma')
              .setRequired(true)
              .addChoices(
                { name: 'Español', value: 'es' },
                { name: 'English', value: 'en' }
              )
         )
    ),

  // OWNER: true → Solo los IDs en OWNER_IDS del .env pueden usarlo
  OWNER: true,
  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const sub = interaction.options.getSubcommand();

    // Subcommand: view
    if (sub === 'view') {
      const embed = createEmbed({
        title: '⚙️ Configuración del Servidor',
        fields: [
          { name: 'Prefix', value: `\`${guildData?.prefix || '!'}\``, inline: true },
          { name: 'Idioma', value: `\`${guildData?.language || 'es'}\``, inline: true },
          { name: 'Canal Bienvenida', value: guildData?.welcomeChannel ? `<#${guildData.welcomeChannel}>` : 'No configurado', inline: true },
          { name: 'Canal Logs', value: guildData?.logChannel ? `<#${guildData.logChannel}>` : 'No configurado', inline: true },
          { name: 'Guild ID', value: `\`${interaction.guildId}\``, inline: false }
        ]
      });

      return interaction.reply({ embeds: [embed] });
    }

    // Subcommand: prefix
    if (sub === 'prefix') {
      const newPrefix = interaction.options.getString('nuevo');
      await updateGuildData(interaction.guildId, { prefix: newPrefix });

      return interaction.reply({
        embeds: [successEmbed(`Prefix actualizado a: \`${newPrefix}\``)]
      });
    }

    // Subcommand: welcome
    if (sub === 'welcome') {
      const channel = interaction.options.getChannel('canal');
      await updateGuildData(interaction.guildId, { welcomeChannel: channel.id });

      return interaction.reply({
        embeds: [successEmbed(`Canal de bienvenidas configurado: ${channel}`)]
      });
    }

    // Subcommand: language
    if (sub === 'language') {
      const lang = interaction.options.getString('idioma');
      await updateGuildData(interaction.guildId, { language: lang });

      return interaction.reply({
        embeds: [successEmbed(`Idioma actualizado a: \`${lang === 'es' ? 'Español' : 'English'}\``)]
      });
    }
  }
};