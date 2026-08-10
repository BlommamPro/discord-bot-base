import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Muestra el banner de un usuario')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a ver (por defecto: tú)')
         .setRequired(false)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: false,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario') || interaction.user;

    // fetch() para obtener el banner (no viene en el objeto user básico)
    const fetchedUser = await client.users.fetch(target.id, { force: true });

    if (!fetchedUser.banner) {
      return interaction.reply({
        embeds: [errorEmbed(`${target.username} no tiene banner.`)],
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = createEmbed({
      title: `🖼️ Banner de ${fetchedUser.username}`,
      image: { url: fetchedUser.bannerURL({ size: 4096, dynamic: true }) }
    });

    await interaction.reply({ embeds: [embed] });
  }
};