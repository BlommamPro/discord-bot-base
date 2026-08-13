import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/embeds.js';
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

    const embed = createEmbed({
      title: `🏦 Balance de ${target.username}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: '💰 En Mano (Wallet)', value: `\`${wallet} coins\``, inline: true },
        { name: '🏦 Banco', value: `\`${bank} / ${maxCapacity} coins\``, inline: true },
        { name: '📊 Total', value: `\`${total} coins\``, inline: true },
        { name: '🔒 Protegido', value: `\`${Math.round((bank / (total || 1)) * 100)}%\``, inline: true },
        { name: '📈 Capacidad Banco', value: `\`${percentUsed}%\` usada`, inline: true },
        { name: '⭐ Nivel Global', value: `\`${level}\``, inline: true }
      ]
    });

    await interaction.reply({ embeds: [embed] });
  }
};