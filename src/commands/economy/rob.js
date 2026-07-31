import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { getUserData, updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Intenta robarle coins a otro usuario')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Víctima del robo')
         .setRequired(true)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario');

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('No puedes robarte a ti mismo.')], ephemeral: true });
    }

    if (target.bot) {
      return interaction.reply({ embeds: [errorEmbed('No puedes robarle a un bot.')], ephemeral: true });
    }

    const cd = await checkDbCooldown(interaction.user.id, 'rob', 120);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`La policía te tiene en la mira. Vuelve <t:${cd.nextTimestamp}:R>.`)],
        ephemeral: true
      });
    }

    const targetData = await getUserData(target.id, target.username);

    if ((targetData?.balance || 0) < 50) {
      return interaction.reply({
        embeds: [errorEmbed(`${target.username} no tiene suficiente dinero para robarle.`)],
        ephemeral: true
      });
    }

    const success = Math.random() < 0.40;

    if (success) {
      const stolenPercent = Math.random() * (0.30 - 0.10) + 0.10;
      const stolen = Math.floor(targetData.balance * stolenPercent);

      await updateUserData(interaction.user.id, { $inc: { balance: stolen } });
      await updateUserData(target.id, { $inc: { balance: -stolen } });
      await setDbCooldown(interaction.user.id, 'rob');

      const embed = successEmbed(`Le robaste **${stolen} coins** a **${target.username}**!`);
      embed.setTitle('🥷 Robo Exitoso');
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor((userData?.balance || 0) * 0.05);

      await updateUserData(interaction.user.id, { $inc: { balance: -fine } });
      await setDbCooldown(interaction.user.id, 'rob');

      const embed = errorEmbed(`**${target.username}** te descubrió y llamó a la policía. Pagaste **${fine} coins** de multa.`);
      embed.setTitle('👮 ¡Te Atraparon!');
      await interaction.reply({ embeds: [embed] });
    }
  }
};