import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { getUserData } from '../../utils/guildData.js';

function getBankCapacity(level) {
  return level * 5000;
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Muestra tu balance bancario y en mano')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a consultar (opcional)')
         .setRequired(false)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 3,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const data = await getUserData(target.id, target.username);

    const wallet = data?.balance || 0;
    const bank = data?.bank || 0;
    const total = wallet + bank;
    const level = data?.level || 1;
    const maxCapacity = getBankCapacity(level);
    const percentUsed = Math.round((bank / maxCapacity) * 100);

    const filled = Math.round((bank / maxCapacity) * 10);
    const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    const embed = createEmbed({
      color: COLORS.ECONOMY,
      title: `🏦 Balance de ${target.username}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      description: [
        `💰 **En Mano:** ${wallet} coins`,
        `🏦 **Banco:** ${bank} / ${maxCapacity} coins`,
        `📊 **Total:** ${total} coins`,
        '',
        `📈 **Capacidad:** \`${progressBar}\` ${percentUsed}%`,
        `⭐ **Nivel:** ${level}`
      ].join('\n')
    });

    await interaction.reply({ embeds: [embed] });
  }
};