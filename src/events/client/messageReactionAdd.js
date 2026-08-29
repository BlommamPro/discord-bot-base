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

    const gw = await Giveaway.findOne({
      messageId: message.id,
      ended: false
    });

    if (!gw) return;

    if (gw.requiredRoleId) {
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (!member || !member.roles.cache.has(gw.requiredRoleId)) {
        await reaction.users.remove(user.id).catch(() => {});
        return;
      }
    }

    const added = await addParticipant(gw.giveawayId, user.id);

    if (added) {
      await updateGiveawayEmbed(message, gw.giveawayId);
    }
  }
};