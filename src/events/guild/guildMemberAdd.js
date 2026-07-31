import { logger } from '../../utils/logger.js';

export default {
  name: 'guildMemberAdd',
  once: false,
  
  async execute(client, member) {
    logger.event(`${member.user.tag} se unió a ${member.guild.name}`);
    // Aquí puedes agregar bienvenidas, roles automáticos, etc.
  }
};