import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { TicketService } from '../../services/TicketService';

const ticketService = new TicketService();

export const ticketCommand: CommandDefinition = {
  name: 'ticket',
  description: 'Manage support tickets.',
  permissions: ['MANAGE_GUILD'],
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets.')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a new ticket')
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('Ticket category')
            .setRequired(true)
            .addChoices(
              { name: 'Support', value: 'support' },
              { name: 'Purchase', value: 'purchase' },
              { name: 'Report', value: 'report' },
              { name: 'Partnership', value: 'partnership' },
              { name: 'Other', value: 'other' }
            )
        )
    )
    .addSubcommand((sub) => sub.setName('close').setDescription('Close the current ticket')),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const category = interaction.options.getString('category')!;

      try {
        const ticket = await ticketService.createTicket(interaction.guildId!, interaction.user.id, category);

        const embed = new EmbedBuilder()
          .setTitle(`✅ Ticket Created`)
          .setDescription(`Ticket channel: <#${ticket.channelId}>`)
          .setColor(0x57f287);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
        await interaction.reply({
          content: `❌ ${errorMessage}`,
          ephemeral: true
        });
      }
    } else if (subcommand === 'close') {
      try {
        const ticket = await ticketService.getTicket(interaction.guildId!, interaction.channelId!);
        if (!ticket) {
          await interaction.reply({
            content: '❌ This is not a ticket channel.',
            ephemeral: true
          });
          return;
        }

        await ticketService.closeTicket(interaction.guildId!, ticket.id);
        await interaction.reply({ content: '✅ Ticket closed.' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to close ticket';
        await interaction.reply({
          content: `❌ ${errorMessage}`,
          ephemeral: true
        });
      }
    }
  }
};
