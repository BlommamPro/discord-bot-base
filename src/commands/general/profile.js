import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { getUserData } from '../../utils/guildData.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Muestra tu perfil o el de otro usuario')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a ver (opcional)')
         .setRequired(false)
    ),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    
    const data = await getUserData(target.id, target.username);

    const embed = createEmbed({
      title: `👤 Perfil de ${target.username}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }), // ✅ STRING, no objeto
      fields: [
        { name: '💰 Dinero', value: `\`${data.balance} coins\``, inline: true },
        { name: '⭐ Nivel', value: `\`${data.level}\``, inline: true },
        { name: '✨ XP', value: `\`${data.xp}\``, inline: true },
        { name: '🔥 Racha Diaria', value: `\`${data.dailyStreak} días\``, inline: true },
        { name: '💬 Mensajes', value: `\`${data.messages}\``, inline: true },
        { name: '📅 Cuenta creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      ]
    });

    await interaction.reply({ embeds: [embed] });
  }
};