import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { updateUserData } from '../../utils/guildData.js';
import { checkDbCooldown, setDbCooldown } from '../../utils/economyCooldowns.js';
import { checkAndAwardBadge, checkRichBadge } from '../../utils/badges.js';

const CRIMES = [
  { 
    name: 'robo a un banco', 
    description: 'planeaste y ejecutaste un atraco perfecto',
    min: 80, max: 350,
    failPenalty: 150,
    emoji: '🏦'
  },
  { 
    name: 'hackeo a una cuenta premium', 
    description: 'descifraste contraseñas de alto nivel',
    min: 60, max: 280,
    failPenalty: 100,
    emoji: '💻'
  },
  { 
    name: 'estafa en el mercado negro', 
    description: 'vendiste productos falsificados',
    min: 50, max: 220,
    failPenalty: 80,
    emoji: '🕵️'
  },
  { 
    name: 'extorsión a un comerciante', 
    description: 'intimidaste a un empresario local',
    min: 100, max: 300,
    failPenalty: 180,
    emoji: '😈'
  },
  { 
    name: 'tráfico de memes raros', 
    description: 'vendiste memes de edición limitada',
    min: 40, max: 180,
    failPenalty: 60,
    emoji: '🤣'
  },
  { 
    name: 'robo de autos de lujo', 
    description: 'te llevaste un deportivo de una concesionaria',
    min: 120, max: 350,
    failPenalty: 200,
    emoji: '🚗'
  },
  { 
    name: 'falsificación de obras de arte', 
    description: 'vendiste cuadros falsos como originales',
    min: 90, max: 280,
    failPenalty: 140,
    emoji: '🎨'
  },
  { 
    name: 'secuestro de datos', 
    description: 'robaste información confidencial',
    min: 70, max: 250,
    failPenalty: 120,
    emoji: '🔒'
  },
  { 
    name: 'contrabando de relojes', 
    description: 'pasaste relojes suizos por aduanas',
    min: 100, max: 320,
    failPenalty: 160,
    emoji: '⌚'
  },
  { 
    name: 'clonación de tarjetas', 
    description: 'copiaste tarjetas de crédito',
    min: 60, max: 200,
    failPenalty: 110,
    emoji: '💳'
  },
  { 
    name: 'robo de criptomonedas', 
    description: 'hackeaste una cartera digital',
    min: 80, max: 300,
    failPenalty: 150,
    emoji: '₿'
  },
  { 
    name: 'estafa piramidal', 
    description: 'convenciste a inversores con falsas promesas',
    min: 110, max: 340,
    failPenalty: 190,
    emoji: '🏛️'
  },
  { 
    name: 'robo en una joyería', 
    description: 'te llevaste diamantes y oro',
    min: 130, max: 360,
    failPenalty: 220,
    emoji: '💎'
  },
  { 
    name: 'tráfico de información', 
    description: 'vendiste secretos corporativos',
    min: 70, max: 260,
    failPenalty: 130,
    emoji: '📊'
  },
  { 
    name: 'asalto a un casino', 
    description: 'robaste en un casino de lujo',
    min: 150, max: 400,
    failPenalty: 250,
    emoji: '🎰'
  },
];

const FAIL_MESSAGES = [
  'la policía te tendió una emboscada y pagaste una fianza',
  'un testigo te delató y tuviste que sobornar al juez',
  'la seguridad privada te atrapó y pagaste una multa',
  'tu cómplice te traicionó y perdiste dinero',
  'las cámaras de seguridad te grabaron y tuviste que pagar abogados',
  'un vecino llamó a la policía y te escapaste pero perdiste el botín'
];

export default {
  CMD: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('🦹 Comete un crimen para ganar (o perder) dinero')
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
        embeds: [errorEmbed(`👮 La policía te vigila. Vuelve a intentarlo <t:${cd.nextTimestamp}:R>.`)],
        flags: MessageFlags.Ephemeral
      });
    }

    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)];
    
    const success = Math.random() < 0.55;

    if (success) {
      const reward = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;

      await updateUserData(interaction.user.id, {
        $inc: { balance: reward, crimes: 1 }
      });
      await setDbCooldown(interaction.user.id, 'crime');

      const newCrimes = (userData.crimes || 0) + 1;
      if (newCrimes >= 50) await checkAndAwardBadge(interaction.user.id, 'crime_lord', client);
      await checkRichBadge(interaction.user.id, client);

      const description = [
        `**${crime.emoji} Cometiste un ${crime.name}**`,
        `📝 ${crime.description} y conseguiste **${reward} coins**!`,
        '',
        `🦹 Nivel de criminal: ${newCrimes} crímenes cometidos`
      ].join('\n');

      const embed = successEmbed(description);
      embed.setTitle('🦹 Crimen Exitoso');
      embed.setFooter({ 
        text: `La policía te buscará por 1 hora`,
        icon: interaction.user.displayAvatarURL()
      });

      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.min(
        Math.floor((userData?.balance || 0) * 0.1),
        crime.failPenalty
      );
      const failMessage = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];

      await updateUserData(interaction.user.id, { $inc: { balance: -fine } });
      await setDbCooldown(interaction.user.id, 'crime');

      const description = [
        `**${crime.emoji} Intentaste un ${crime.name}**`,
        `📝 Fallaste porque ${failMessage} y pagaste **${fine} coins** de multa.`,
        '',
        `👮 La policía tiene tu identificación, tendrás que esconderte.`
      ].join('\n');

      const embed = errorEmbed(description);
      embed.setTitle('👮 ¡Te Atraparon!');
      embed.setFooter({ 
        text: `Vuelve a intentarlo en 1 hora`,
        icon: interaction.user.displayAvatarURL()
      });

      await interaction.reply({ embeds: [embed] });
    }
  }
};