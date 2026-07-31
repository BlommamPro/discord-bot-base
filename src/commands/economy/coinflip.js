import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Apuesta a cara o cruz')
    .setDMPermission(false)
    .addIntegerOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad a apostar')
         .setRequired(true)
         .setMinValue(10)
    )
    .addStringOption(opt =>
      opt.setName('lado')
         .setDescription('Cara o cruz')
         .setRequired(true)
         .addChoices(
           { name: '🪙 Cara', value: 'cara' },
           { name: '❌ Cruz', value: 'cruz' }
         )
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const amount = interaction.options.getInteger('cantidad');
    const side = interaction.options.getString('lado');

    if ((userData?.balance || 0) < amount) {
      return interaction.reply({
        embeds: [errorEmbed(`No tienes suficientes coins. Tienes **${userData.balance}** y apostaste **${amount}**.`)],
        ephemeral: true
      });
    }

    const cd = await checkDbCooldown(interaction.user.id, 'coinflip', 0.17);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`Espera un momento antes de volver a apostar. <t:${cd.nextTimestamp}:R>.`)],
        ephemeral: true
      });
    }

    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const won = result === side;

    await setDbCooldown(interaction.user.id, 'coinflip');

    if (won) {
      await updateUserData(interaction.user.id, { $inc: { balance: amount } });
      const embed = successEmbed(`¡Salió **${result.toUpperCase()}**! Ganaste **${amount} coins**.`);
      embed.setTitle('🪙 ¡Ganaste!');
      await interaction.reply({ embeds: [embed] });
    } else {
      await updateUserData(interaction.user.id, { $inc: { balance: -amount } });
      const embed = errorEmbed(`Salió **${result.toUpperCase()}**... Perdiste **${amount} coins**.`);
      embed.setTitle('💀 Perdiste');
      await interaction.reply({ embeds: [embed] });
    }
  }
};