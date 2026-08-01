import { Giveaway } from '../../models/Giveaway.js';
import { addParticipant, updateGiveawayEmbed } from '../../utils/giveawayHandler.js';

export default {
  name: 'messageReactionAdd',
  once: false,

  async execute(client, reaction, user) {
    if (user.bot) return;
    if (reaction.emoji.name !== '🎉') return;

    const message = reaction.message;
    if (!message.guild) return;

    // Buscar giveaway por messageId
    const gw = await Giveaway.findOne({
      messageId: message.id,
      ended: false
    });

    if (!gw) return;

    // Verificar rol requerido
    if (gw.requiredRoleId) {
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (!member || !member.roles.cache.has(gw.requiredRoleId)) {
        await reaction.users.remove(user.id).catch(() => {});
        return;
      }
    }

    // Añadir participante
    const added = await addParticipant(gw.giveawayId, user.id);
    
    // Actualizar embed (con throttling interno de 8 segundos)
    if (added) {
      await updateGiveawayEmbed(message, gw.giveawayId);
    }
  }
};