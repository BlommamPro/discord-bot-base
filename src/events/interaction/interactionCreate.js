import { config } from '../../../config/config.js';
import { checkCooldown } from '../../utils/cooldowns.js';
import { checkPermissions, checkBotPermissions } from '../../utils/permissions.js';
import { parseCustomId } from '../../utils/parseCustomId.js';
import { errorEmbed, cooldownEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { getGuildData, getUserData } from '../../utils/guildData.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(client, interaction) {
    // ===== SLASH COMMANDS =====
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      // Owner only
      if (command.OWNER && !config.ownerIds.includes(interaction.user.id)) {
        return interaction.reply({ embeds: [errorEmbed('Solo los owners pueden usar este comando')], ephemeral: true });
      }

      // Guild only
      if (command.GUILD_ONLY && !interaction.guild) {
        return interaction.reply({ embeds: [errorEmbed('Este comando solo se puede usar en servidores')], ephemeral: true });
      }

      // NSFW
      if (command.NSFW && !interaction.channel.nsfw) {
        return interaction.reply({ embeds: [errorEmbed('Este comando solo se puede usar en canales NSFW')], ephemeral: true });
      }

      // Permisos de usuario
      if (command.PERMISSIONS?.length && interaction.guild) {
        const permCheck = checkPermissions(interaction.member, command.PERMISSIONS);
        if (!permCheck.allowed) {
          return interaction.reply({
            embeds: [errorEmbed(`Necesitas los permisos: \`${permCheck.missing.join(', ')}\``)],
            ephemeral: true
          });
        }
      }

      // Permisos del bot
      if (command.BOT_PERMISSIONS?.length && interaction.guild) {
        const botPermCheck = checkBotPermissions(interaction.guild.members.me, command.BOT_PERMISSIONS);
        if (!botPermCheck.allowed) {
          return interaction.reply({
            embeds: [errorEmbed(`Necesito los permisos: \`${botPermCheck.missing.join(', ')}\``)],
            ephemeral: true
          });
        }
      }

      // Cooldown
      const { onCooldown, timeLeft } = checkCooldown(
        client,
        command.CMD.name,
        interaction.user.id,
        command.COOLDOWN || 3
      );
      if (onCooldown) {
        return interaction.reply({ embeds: [cooldownEmbed(timeLeft)], ephemeral: true });
      }

      // Ejecutar con datos de guild y usuario desde MongoDB
      try {
        let guildData = null;
        let userData = null;

        if (interaction.guildId) {
          guildData = await getGuildData(interaction.guildId);
        }

        // userData es GLOBAL (balance, xp, inventario) — siempre cargar
        userData = await getUserData(interaction.user.id, interaction.user.username);

        await command.execute(client, interaction, guildData, userData);
        logger.cmd(`[SLASH] ${interaction.user.tag} → /${command.CMD.name}`);
      } catch (err) {
        logger.error(`Error en /${command.CMD.name}:`, err);
        const reply = { embeds: [errorEmbed('Ocurrió un error al ejecutar el comando')], ephemeral: true };
        interaction.replied || interaction.deferred
          ? interaction.followUp(reply)
          : interaction.reply(reply);
      }
    }

    // ===== CONTEXT MENUS =====
    else if (interaction.isContextMenuCommand()) {
      const menu = client.contextMenus.get(interaction.commandName);
      if (!menu) return;

      try {
        let guildData = null;
        let userData = null;

        if (interaction.guildId) {
          guildData = await getGuildData(interaction.guildId);
        }

        userData = await getUserData(interaction.user.id, interaction.user.username);

        await menu.execute(client, interaction, guildData, userData);
        logger.cmd(`[CTX] ${interaction.user.tag} → ${menu.CMD.name}`);
      } catch (err) {
        logger.error(`Error en context menu ${menu.CMD.name}:`, err);
        interaction.reply({ embeds: [errorEmbed('Error al ejecutar el menú contextual')], ephemeral: true });
      }
    }

    // ===== BUTTONS =====
    else if (interaction.isButton()) {
      await handleComponent(client, interaction, 'buttons');
    }

    // ===== SELECT MENUS =====
    else if (interaction.isAnySelectMenu()) {
      await handleComponent(client, interaction, 'selectMenus');
    }

    // ===== MODALS =====
    else if (interaction.isModalSubmit()) {
      await handleComponent(client, interaction, 'modals');
    }
  }
};

async function handleComponent(client, interaction, type) {
  const collection = client[type];
  let handler = null;
  let args = [];

  // Buscar coincidencia exacta primero
  handler = collection.get(interaction.customId);

  // Si no hay coincidencia exacta, buscar por patrón
  if (!handler) {
    for (const [pattern, h] of collection) {
      const parsed = parseCustomId(interaction.customId, pattern);
      if (parsed !== null) {
        handler = h;
        args = parsed;
        break;
      }
    }
  }

  if (!handler) return;

  // Owner only
  if (handler.OWNER && !config.ownerIds.includes(interaction.user.id)) {
    return interaction.reply({ embeds: [errorEmbed('Solo los owners pueden usar esto')], ephemeral: true });
  }

  // Permisos
  if (handler.PERMISSIONS?.length && interaction.guild) {
    const permCheck = checkPermissions(interaction.member, handler.PERMISSIONS);
    if (!permCheck.allowed) {
      return interaction.reply({
        embeds: [errorEmbed(`Necesitas los permisos: \`${permCheck.missing.join(', ')}\``)],
        ephemeral: true
      });
    }
  }

  // Cooldown
  const { onCooldown, timeLeft } = checkCooldown(
    client,
    handler.customId,
    interaction.user.id,
    handler.COOLDOWN || 3
  );
  if (onCooldown) {
    return interaction.reply({ embeds: [cooldownEmbed(timeLeft)], ephemeral: true });
  }

  try {
    let guildData = null;
    let userData = null;

    if (interaction.guildId) {
      guildData = await getGuildData(interaction.guildId);
    }

    userData = await getUserData(interaction.user.id, interaction.user.username);

    await handler.execute(client, interaction, args, guildData, userData);
    logger.cmd(`[${type.toUpperCase()}] ${interaction.user.tag} → ${interaction.customId}`);
  } catch (err) {
    logger.error(`Error en ${type} ${interaction.customId}:`, err);
    const reply = { embeds: [errorEmbed('Ocurrió un error')], ephemeral: true };
    interaction.replied || interaction.deferred
      ? interaction.followUp(reply)
      : interaction.reply(reply);
  }
}