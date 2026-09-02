import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed, createEmbed, COLORS } from '../../utils/embeds.js';
import { createShopItem, deleteShopItem, getAllShopItems, updateShopItem } from '../../utils/shop.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('shopconfig')
    .setDescription('🛒 Configura la tienda del servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('➕ Añadir item a la tienda')
        .addStringOption(opt => 
          opt.setName('id')
            .setDescription('ID único del item (ej: vip-role)')
            .setRequired(true)
        )
        .addStringOption(opt => 
          opt.setName('nombre')
            .setDescription('Nombre visible')
            .setRequired(true)
        )
        .addIntegerOption(opt => 
          opt.setName('precio')
            .setDescription('Precio en coins')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(opt => 
          opt.setName('descripcion')
            .setDescription('Descripción')
            .setRequired(false)
        )
        .addRoleOption(opt => 
          opt.setName('rol')
            .setDescription('Rol que se otorga al comprar')
            .setRequired(false)
        )
        .addIntegerOption(opt => 
          opt.setName('stock')
            .setDescription('Stock (-1 = ilimitado)')
            .setRequired(false)
            .setMinValue(-1)
        )
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('✏️ Editar un item existente')
        .addStringOption(opt => 
          opt.setName('id')
            .setDescription('ID del item a editar')
            .setRequired(true)
        )
        .addStringOption(opt => 
          opt.setName('nombre')
            .setDescription('Nuevo nombre')
            .setRequired(false)
        )
        .addIntegerOption(opt => 
          opt.setName('precio')
            .setDescription('Nuevo precio')
            .setRequired(false)
            .setMinValue(1)
        )
        .addStringOption(opt => 
          opt.setName('descripcion')
            .setDescription('Nueva descripción')
            .setRequired(false)
        )
        .addIntegerOption(opt => 
          opt.setName('stock')
            .setDescription('Nuevo stock (-1 = ilimitado)')
            .setRequired(false)
            .setMinValue(-1)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('🗑️ Eliminar item de la tienda')
        .addStringOption(opt => 
          opt.setName('id')
            .setDescription('ID del item')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('🔧 Activar o desactivar un item')
        .addStringOption(opt => 
          opt.setName('id')
            .setDescription('ID del item')
            .setRequired(true)
        )
        .addBooleanOption(opt => 
          opt.setName('estado')
            .setDescription('true = activado, false = desactivado')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('📋 Ver todos los items de la tienda')
    ),

  PERMISSIONS: ['Administrator'],
  BOT_PERMISSIONS: [],
  OWNER: false,
  COOLDOWN: 5,
  GUILD_ONLY: true,

  async execute(client, interaction, guildData, userData) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const itemId = interaction.options.getString('id');
      const name = interaction.options.getString('nombre');
      const price = interaction.options.getInteger('precio');
      const description = interaction.options.getString('descripcion') || '';
      const role = interaction.options.getRole('rol');
      const stock = interaction.options.getInteger('stock') ?? -1;

      if (role) {
        const botMember = interaction.guild.members.me;
        if (!botMember.permissions.has('ManageRoles')) {
          return interaction.reply({
            embeds: [errorEmbed('❌ No tengo permiso para gestionar roles.')],
            flags: MessageFlags.Ephemeral
          });
        }
        if (role.position >= botMember.roles.highest.position) {
          return interaction.reply({
            embeds: [errorEmbed(`❌ El rol ${role} está por encima de mi rol más alto. No puedo asignarlo.`)],
            flags: MessageFlags.Ephemeral
          });
        }
      }

      try {
        await createShopItem(
          interaction.guildId,
          itemId,
          name,
          description,
          price,
          role?.id || null,
          stock
        );

        return interaction.reply({
          embeds: [successEmbed(
            `✅ **${name}** (\`${itemId}\`) añadido a la tienda.\n` +
            `💰 Precio: **${price}** coins\n` +
            `📦 Stock: **${stock === -1 ? '∞ Ilimitado' : stock}**\n` +
            (role ? `🎭 Rol: ${role}` : '')
          )]
        });
      } catch (err) {
        if (err.code === 11000) {
          return interaction.reply({
            embeds: [errorEmbed(`❌ Ya existe un item con el ID \`${itemId}\`.`)]
          });
        }
        throw err;
      }
    }

    if (sub === 'edit') {
      const itemId = interaction.options.getString('id');
      const name = interaction.options.getString('nombre');
      const price = interaction.options.getInteger('precio');
      const description = interaction.options.getString('descripcion');
      const stock = interaction.options.getInteger('stock');

      if (!name && price === null && !description && stock === null) {
        return interaction.reply({
          embeds: [errorEmbed('❌ Debes proporcionar al menos un campo para editar.')],
          flags: MessageFlags.Ephemeral
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (price !== null) updateData.price = price;
      if (description !== null) updateData.description = description;
      if (stock !== null) updateData.stock = stock;

      const result = await updateShopItem(interaction.guildId, itemId, updateData);

      if (!result) {
        return interaction.reply({
          embeds: [errorEmbed(`❌ No encontré el item \`${itemId}\`.`)]
        });
      }

      return interaction.reply({
        embeds: [successEmbed(`✅ Item \`${itemId}\` actualizado correctamente.`)]
      });
    }

    if (sub === 'remove') {
      const itemId = interaction.options.getString('id');
      const result = await deleteShopItem(interaction.guildId, itemId);

      if (!result) {
        return interaction.reply({
          embeds: [errorEmbed(`❌ No encontré el item \`${itemId}\`.`)]
        });
      }

      return interaction.reply({
        embeds: [successEmbed(`✅ Item \`${itemId}\` eliminado de la tienda.`)]
      });
    }

    if (sub === 'toggle') {
      const itemId = interaction.options.getString('id');
      const enabled = interaction.options.getBoolean('estado');

      const result = await updateShopItem(interaction.guildId, itemId, { enabled });

      if (!result) {
        return interaction.reply({
          embeds: [errorEmbed(`❌ No encontré el item \`${itemId}\`.`)]
        });
      }

      return interaction.reply({
        embeds: [successEmbed(
          `✅ Item \`${itemId}\` ${enabled ? 'activado' : 'desactivado'}.`
        )]
      });
    }

    if (sub === 'list') {
      const items = await getAllShopItems(interaction.guildId);

      if (items.length === 0) {
        return interaction.reply({
          embeds: [errorEmbed('❌ La tienda está vacía. Usa `/shopconfig add` para añadir items.')]
        });
      }

      const activeCount = items.filter(i => i.enabled).length;
      const disabledCount = items.filter(i => !i.enabled).length;

      const fields = items.map(item => ({
        name: `${item.enabled ? '🟢' : '🔴'} ${item.name} (\`${item.itemId}\`)`,
        value: [
          `💰 **Precio:** ${item.price} coins`,
          `📦 **Stock:** ${item.stock === -1 ? '∞ Ilimitado' : item.stock}`,
          item.roleId ? `🎭 **Rol:** <@&${item.roleId}>` : '',
          item.description ? `📝 ${item.description}` : '',
          item.enabled ? '' : '⚠️ **DESACTIVADO**'
        ].filter(Boolean).join('\n'),
        inline: false
      }));

      const embed = createEmbed({
        color: COLORS.ECONOMY,
        title: `🛒 Gestión de Tienda (${items.length} items)`,
        description: [
          `🟢 **Activos:** ${activeCount}`,
          `🔴 **Desactivados:** ${disabledCount}`,
          '',
          `Usa \`/shopconfig toggle <id> estado:false\` para desactivar un item.`
        ].join('\n'),
        fields: fields.slice(0, 25),
        footer: {
          text: `Usa /shopconfig add para añadir más items`,
          icon: interaction.user.displayAvatarURL()
        }
      });

      return interaction.reply({ embeds: [embed] });
    }
  }
};