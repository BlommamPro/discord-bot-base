import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';

function getBankCapacity(level) {
  return level * 5000; // Nivel 1 = 5000, nivel 10 = 50000, etc.
}

export default {
  CMD: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposita dinero en el banco')
    .setDMPermission(false)
    .addStringOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad a depositar o "all" para todo')
         .setRequired(true)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const input = interaction.options.getString('cantidad').toLowerCase().trim();
    const currentWallet = userData?.balance || 0;
    const currentBank = userData?.bank || 0;
    const userLevel = userData?.level || 1;
    const maxCapacity = getBankCapacity(userLevel);

    let amount = 0;

    if (input === 'all') {
      amount = currentWallet;
    } else {
      amount = parseInt(input, 10);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          embeds: [errorEmbed('Introduce una cantidad válida o `all`.')],
          flags: MessageFlags.Ephemeral
        });
      }
    }

    if (currentWallet <= 0) {
      return interaction.reply({
        embeds: [errorEmbed('No tienes dinero en mano para depositar.')],
        flags: MessageFlags.Ephemeral
      });
    }

    // ===== RESTRICCION 1: No puedes quedarte con 0 en mano =====
    if (amount >= currentWallet) {
      amount = currentWallet - 1;
      if (amount <= 0) {
        return interaction.reply({
          embeds: [errorEmbed('Debes dejar al menos **1 coin** en mano. No puedes depositar todo.')],
          flags: MessageFlags.Ephemeral
        });
      }
    }

    // ===== RESTRICCION 2: Capacidad maxima del banco =====
    const spaceLeft = maxCapacity - currentBank;
    if (spaceLeft <= 0) {
      return interaction.reply({
        embeds: [errorEmbed(`Tu banco está lleno. Capacidad máxima: **${maxCapacity} coins** (Nivel ${userLevel}). Sube de nivel para aumentarla.`)],
        flags: MessageFlags.Ephemeral
      });
    }

    if (amount > spaceLeft) {
      amount = spaceLeft;
    }

    await updateUserData(interaction.user.id, {
      $inc: { balance: -amount, bank: amount }
    });

    const newWallet = currentWallet - amount;
    const newBank = currentBank + amount;

    const embed = successEmbed(
      `Depositaste **${amount} coins** en el banco.\n\n` +
      `💰 En mano: **${newWallet}**\n` +
      `🏦 Banco: **${newBank} / ${maxCapacity}**\n` +
      `📊 Total: **${newWallet + newBank}**\n` +
      `📈 Capacidad usada: **${Math.round((newBank / maxCapacity) * 100)}%**`
    );
    embed.setTitle('🏦 Depósito Exitoso');

    await interaction.reply({ embeds: [embed] });
  }
};