import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

const SLOTS = ['🍒', '🍋', '💎', '7️⃣', '🍀', '🔔'];

function spin() {
  return [
    SLOTS[Math.floor(Math.random() * SLOTS.length)],
    SLOTS[Math.floor(Math.random() * SLOTS.length)],
    SLOTS[Math.floor(Math.random() * SLOTS.length)]
  ];
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Juega a la tragamonedas')
    .setDMPermission(false)
    .addIntegerOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad a apostar')
         .setRequired(true)
         .setMinValue(10)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const amount = interaction.options.getInteger('cantidad');

    if ((userData?.balance || 0) < amount) {
      return interaction.reply({
        embeds: [errorEmbed(`No tienes suficientes coins. Tienes **${userData.balance}** y apostaste **${amount}**.`)],
        ephemeral: true
      });
    }

    const cd = await checkDbCooldown(interaction.user.id, 'slots', 0.25);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`La máquina se está enfriando. Vuelve <t:${cd.nextTimestamp}:R>.`)],
        ephemeral: true
      });
    }

    await setDbCooldown(interaction.user.id, 'slots');

    const result = spin();
    const [a, b, c] = result;

    let winnings = 0;
    let title = '';

    if (a === b && b === c) {
      if (a === '7️⃣') {
        winnings = amount * 10;
        title = '🎰 ¡MEGA JACKPOT! 7️⃣7️⃣7️⃣';
      } else if (a === '💎') {
        winnings = amount * 5;
        title = '💎 ¡DIAMOND JACKPOT!';
      } else {
        winnings = amount * 3;
        title = '🎉 ¡JACKPOT!';
      }
    } else if (a === b || b === c || a === c) {
      winnings = amount * 1.5;
      title = '✨ ¡Casi! 2 iguales';
    } else {
      winnings = -amount;
      title = '😢 Mala suerte';
    }

    await updateUserData(interaction.user.id, { $inc: { balance: Math.floor(winnings) } });

    const display = `| ${a} | ${b} | ${c} |`;
    const net = Math.floor(winnings);

    const embed = net >= 0
      ? successEmbed(`${display}

Ganaste **${net} coins**!`)
      : errorEmbed(`${display}

Perdiste **${amount} coins**...`);

    embed.setTitle(title);

    await interaction.reply({ embeds: [embed] });
  }
};