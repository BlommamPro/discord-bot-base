import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';

const ITEMS_PER_PAGE = 10;

export default {
  CMD: new SlashCommandBuilder()
    .setName('guilds')
    .setDescription('Lista todos los servidores donde está el bot (SOLO OWNER)')
    .setDMPermission(true),

  OWNER: true,
  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  COOLDOWN: 5,

  async execute(client, interaction, guildData, userData) {
    const guilds = Array.from(client.guilds.cache.values());

    if (guilds.length === 0) {
      return interaction.reply({ embeds: [errorEmbed('El bot no está en ningún servidor.')], ephemeral: true });
    }

    const totalPages = Math.ceil(guilds.length / ITEMS_PER_PAGE);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageGuilds = guilds.slice(start, end);

      const fields = pageGuilds.map((g, i) => ({
        name: `${start + i + 1}. ${g.name}`,
        value: [
          `\`ID:\` ${g.id}`,
          `\`Miembros:\` ${g.memberCount}`,
          `\`Owner:\` <@${g.ownerId}>`,
          `\`Creado:\` <t:${Math.floor(g.createdTimestamp / 1000)}:R>`
        ].join('\n'),
        inline: false
      }));

      return createEmbed({
        title: `🏘️ Servidores (${guilds.length})`,
        description: `Página **${page + 1}** de **${totalPages}**`,
        fields
      });
    };

    const generateButtons = (page) => {
      const row = new ActionRowBuilder();

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`guilds-prev-{${interaction.user.id}}`)
          .setLabel('◀ Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId(`guilds-next-{${interaction.user.id}}`)
          .setLabel('Siguiente ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );

      return row;
    };

    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: totalPages > 1 ? [generateButtons(currentPage)] : [],
      ephemeral: true,
      withResponse: true
    });

    // Si solo hay una página, no necesitamos collector
    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 120000
    });

    collector.on('collect', async (i) => {
      if (i.customId.startsWith('guilds-prev')) {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId.startsWith('guilds-next')) {
        currentPage = Math.min(totalPages - 1, currentPage + 1);
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch { /* mensaje ya borrado */ }
    });
  }
};