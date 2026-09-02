import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';
import { checkRichBadge } from '../../utils/badges.js';

const JOBS = [
  { 
    name: 'desarrollador de software', 
    description: 'trabajaste en una startup tecnológica',
    min: 60, max: 150,
    emoji: '💻'
  },
  { 
    name: 'chef', 
    description: 'cocinaste en un restaurante de lujo',
    min: 40, max: 120,
    emoji: '👨‍🍳'
  },
  { 
    name: 'músico callejero', 
    description: 'tocaste en la plaza principal',
    min: 20, max: 80,
    emoji: '🎵'
  },
  { 
    name: 'entrenador personal', 
    description: 'diste clases de fitness',
    min: 35, max: 100,
    emoji: '💪'
  },
  { 
    name: 'diseñador gráfico', 
    description: 'hiciste logos para clientes',
    min: 45, max: 130,
    emoji: '🎨'
  },
  { 
    name: 'repartidor de comida', 
    description: 'entregaste pedidos en bicicleta',
    min: 25, max: 70,
    emoji: '🛵'
  },
  { 
    name: 'fotógrafo de bodas', 
    description: 'capturaste momentos especiales',
    min: 50, max: 140,
    emoji: '📸'
  },
  { 
    name: 'profesor particular', 
    description: 'diste clases de matemáticas',
    min: 30, max: 90,
    emoji: '📚'
  },
  { 
    name: 'jardinero', 
    description: 'cuidaste jardines de casas elegantes',
    min: 25, max: 75,
    emoji: '🌱'
  },
  { 
    name: 'tatuador', 
    description: 'hiciste tatuajes personalizados',
    min: 55, max: 145,
    emoji: '💉'
  },
  { 
    name: 'piloto de drones', 
    description: 'filmaste paisajes desde el aire',
    min: 40, max: 110,
    emoji: '🚁'
  },
  { 
    name: 'escritor freelance', 
    description: 'redactaste artículos para una revista',
    min: 35, max: 95,
    emoji: '✍️'
  },
  { 
    name: 'masajista', 
    description: 'diste masajes relajantes',
    min: 30, max: 85,
    emoji: '💆'
  },
  { 
    name: 'electricista', 
    description: 'arreglaste instalaciones eléctricas',
    min: 45, max: 125,
    emoji: '⚡'
  },
  { 
    name: 'barista', 
    description: 'preparaste café en una cafetería',
    min: 20, max: 60,
    emoji: '☕'
  },
  { 
    name: 'youtuber', 
    description: 'subiste un video que se volvió viral',
    min: 50, max: 150,
    emoji: '📹'
  },
  { 
    name: 'reparador de consolas', 
    description: 'arreglaste consolas de videojuegos',
    min: 40, max: 100,
    emoji: '🎮'
  },
  { 
    name: 'cartero', 
    description: 'repartiste correo en tu vecindario',
    min: 25, max: 65,
    emoji: '📬'
  },
  { 
    name: 'cerrajero', 
    description: 'abriste puertas cerradas',
    min: 50, max: 130,
    emoji: '🔑'
  },
  { 
    name: 'traductor', 
    description: 'tradujiste documentos importantes',
    min: 40, max: 110,
    emoji: '🌐'
  },
];

export default {
  CMD: new SlashCommandBuilder()
    .setName('work')
    .setDescription('💼 Trabaja para ganar coins')
    .setDMPermission(false),

  PERMISSIONS: [],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 0,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const cd = await checkDbCooldown(interaction.user.id, 'work', 30);
    if (cd.onCooldown) {
      return interaction.reply({
        embeds: [errorEmbed(`⏳ Ya trabajaste recientemente. Vuelve <t:${cd.nextTimestamp}:R>.`)],
        flags: MessageFlags.Ephemeral
      });
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const isBadDay = Math.random() < 0.4;
    let reward;
    let quality = '';

    if (isBadDay) {
      reward = Math.floor(Math.random() * (50 - 25 + 1)) + 25;
      quality = 'tuviste un mal día y apenas';
    } else {
      reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      
      if (reward >= 120) quality = 'tuviste un excelente día y';
      else if (reward >= 80) quality = 'trabajaste muy bien y';
      else quality = 'trabajaste bien y';
    }

    await updateUserData(interaction.user.id, { $inc: { balance: reward } });
    await setDbCooldown(interaction.user.id, 'work');
    await checkRichBadge(interaction.user.id, client);

    const description = [
      `**${job.emoji} Trabajaste como ${job.name}**`,
      `📝 ${job.description} y ${quality} ganaste **${reward} coins**!`
    ].join('\n');

    const embed = successEmbed(description);
    embed.setTitle('💼 Trabajo Completado');
    embed.setFooter({ 
      text: `Vuelve a trabajar en 30 minutos`,
      icon: interaction.user.displayAvatarURL()
    });

    await interaction.reply({ embeds: [embed] });
  }
};