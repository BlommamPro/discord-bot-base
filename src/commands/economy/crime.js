import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';

const CRIMES = [
  { name: 'robaste un banco', min: 100, max: 300 },
  { name: 'hackeaste una cuenta', min: 80, max: 250 },
  { name: 'vendiste objetos "encontrados"', min: 50, max: 200 },
  { name: 'extorsionaste a un comerciante', min: 120, max: 280 },
  { name: 'traficaste memes raros', min: 60, max: 180 }
];

const FAIL_MESSAGES = [
  'te atrapó la policía y pagaste fianza',
  'el objetivo tenía seguridad privada',
  'alguien te delató',
  'fallaste estrepitosamente'
];

export default {
  CMD: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Comete un crimen para ganar (o perder) dinero')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const cd = await checkDbCooldown(interaction.user.id, 'crime', 60);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`La policía te vigila. Vuelve a intentarlo <t:${cd.nextTimestamp}:R>.`)], flags: MessageFlags.Ephemeral });
    }

    const success = Math.random() < 0.55;

    if (success) {
      const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)];
      const reward = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;

      await updateUserData(interaction.user.id, { $inc: { balance: reward } });
      await setDbCooldown(interaction.user.id, 'crime');

      const embed = successEmbed(`**${crime.name}** y ganaste **${reward} coins**!`);
      embed.setTitle('🦹 Crimen Exitoso');
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor((userData?.balance || 0) * 0.1);
      const msg = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];

      await updateUserData(interaction.user.id, { $inc: { balance: -fine } });
      await setDbCooldown(interaction.user.id, 'crime');

      const embed = errorEmbed(`**${msg}** y pagaste **${fine} coins** de multa.`);
      embed.setTitle('👮 ¡Atrapado!');
      await interaction.reply({ embeds: [embed] });
    }
  }
};