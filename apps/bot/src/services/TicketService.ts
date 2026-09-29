import { prisma } from '@tamilanpride/database';
import { Guild, User, ChannelType, PermissionFlagsBits, TextChannel, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger';

export class TicketService {
  async createTicket(
    guildId: string,
    creatorId: string,
    category: string
  ) {
    try {
      const guild = await (global as any).client?.guilds.fetch(guildId);
      if (!guild) {
        throw new Error('Guild not found');
      }

      // Check for existing open ticket
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          guildId,
          creatorId,
          status: 'open'
        }
      });

      if (existingTicket) {
        throw new Error('You already have an open ticket.');
      }

      // Create channel
      const channel = await guild.channels.create({
        name: `ticket-${creatorId.slice(0, 5)}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: creatorId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: guild.client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
          }
        ]
      });

      // Create ticket record
      const ticket = await prisma.ticket.create({
        data: {
          guildId,
          channelId: channel.id,
          creatorId,
          category,
          status: 'open'
        }
      });

      // Send welcome message
      const embed = new EmbedBuilder()
        .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Ticket`)
        .setDescription('A staff member will respond shortly.')
        .setColor(0x5865f2);

      await channel.send({ content: `<@${creatorId}>`, embeds: [embed] });

      return ticket;
    } catch (error) {
      logger.error(`Failed to create ticket in guild ${guildId}`, error);
      throw error;
    }
  }

  async closeTicket(guildId: string, ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket || ticket.guildId !== guildId) {
      throw new Error('Ticket not found.');
    }

    const guild = await (global as any).client?.guilds.fetch(guildId);
    if (!guild) {
      throw new Error('Guild not found');
    }

    const channel = guild.channels.cache.get(ticket.channelId) as TextChannel | undefined;
    if (channel) {
      await channel.delete().catch(() => {});
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'closed' }
    });
  }

  async getTicket(guildId: string, channelId: string) {
    return prisma.ticket.findFirst({
      where: {
        guildId,
        channelId
      }
    });
  }
}
