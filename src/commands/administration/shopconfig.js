import { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { createShopItem, deleteShopItem, getShopItems } from '../../utils/shop.js';
import { emojis } from '../../utils/emojis.js';

export default {
  CMD: new SlashCommandBuilder()
    .setName('shopconfig')
    .setDescription('Configura la tienda del servidor')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
         .setDescription('Añadir item a la tienda')
         .addStringOption(opt => opt.setName('id').setDescription('ID único del item (ej: vip-role)').setRequired(true))
         .addStringOption(opt => opt.setName('nombre').setDescription('Nombre visible').setRequired(true))
         .addIntegerOption(opt => opt.setName('precio').setDescription('Precio en coins').setRequired(true).setMinValue(1))
         .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción').setRequired(false))
         .addRoleOption(opt => opt.setName('rol').setDescription('Rol que se otorga al comprar').setRequired(false))
         .addIntegerOption(opt => opt.setName('stock').setDescription('Stock (-1 = ilimitado)').setRequired(false).setMinValue(-1))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Eliminar item de la tienda')
         .addStringOption(opt => opt.setName('id').setDescription('ID del item').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('Ver items de la tienda')
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
          embeds: [successEmbed(`Item **${name}** (\`${itemId}\`) añadido por **${price} coins**.`)]
        });
      } catch (err) {
        if (err.code === 11000) {
          return interaction.reply({ embeds: [errorEmbed('Ya existe un item con ese ID.')], flags: MessageFlags.Ephemeral });
        }
        throw err;
      }
    }

    if (sub === 'remove') {
      const itemId = interaction.options.getString('id');
      const result = await deleteShopItem(interaction.guildId, itemId);

      if (!result) {
        return interaction.reply({ embeds: [errorEmbed('No encontré ese item.')], flags: MessageFlags.Ephemeral });
      }

      return interaction.reply({ embeds: [successEmbed(`Item \`${itemId}\` eliminado.`)] });
    }

    if (sub === 'list') {
      const items = await getShopItems(interaction.guildId);

      if (items.length === 0) {
        return interaction.reply({ embeds: [errorEmbed('La tienda está vacía.')], flags: MessageFlags.Ephemeral });
      }

      const list = items.map(i =>
        `\`${i.itemId}\` — **${i.name}** — 💰 ${i.price} — 📦 ${i.stock >= 0 ? i.stock : '∞'}`
      ).join('\n');

      return interaction.reply({
        embeds: [successEmbed(list).setTitle('🛒 Items de la Tienda')]
      });
    }
  }
};