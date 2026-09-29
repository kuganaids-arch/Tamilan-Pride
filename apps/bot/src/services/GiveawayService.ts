import { prisma } from '@tamilanpride/database';
import { Guild, TextChannel, Message, User, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../utils/logger';

export class GiveawayService {
  async createGiveaway(
    guildId: string,
    channelId: string,
    prize: string,
    durationMs: number,
    winnerCount: number
  ) {
    const guild = await (global as any).client?.guilds.fetch(guildId);
    if (!guild) {
      throw new Error('Guild not found');
    }

    const channel = guild.channels.cache.get(channelId) as TextChannel | undefined;
    if (!channel || !channel.isSendable()) {
      throw new Error('Cannot access channel');
    }

    const endsAt = new Date(Date.now() + durationMs);

    // Send giveaway message
    const button = new ButtonBuilder()
      .setCustomId('giveaway_enter')
      .setLabel('🎉 Enter Giveaway')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${prize}`)
      .setDescription(`Click the button below to enter!\n\nEnds: <t:${Math.floor(endsAt.getTime() / 1000)}:R>`)
      .setColor(0xffd700);

    const message = await channel.send({
      embeds: [embed],
      components: [row]
    });

    // Create giveaway record
    const giveaway = await prisma.giveaway.create({
      data: {
        guildId,
        channelId,
        messageId: message.id,
        prize,
        endsAt,
        winnerCount,
        ended: false
      }
    });

    // Schedule end
    setTimeout(() => this.endGiveaway(giveaway.id, guildId), durationMs);

    return giveaway;
  }

  async endGiveaway(giveawayId: string, guildId: string) {
    try {
      const giveaway = await prisma.giveaway.findUnique({
        where: { id: giveawayId }
      });

      if (!giveaway || giveaway.ended) {
        return;
      }

      const guild = await (global as any).client?.guilds.fetch(guildId);
      if (!guild) {
        return;
      }

      const channel = guild.channels.cache.get(giveaway.channelId) as TextChannel | undefined;
      if (!channel) {
        return;
      }

      // Note: In production, you'd track entries in database or cache
      // This is a simplified version
      await prisma.giveaway.update({
        where: { id: giveawayId },
        data: { ended: true }
      });

      const embed = new EmbedBuilder()
        .setTitle(`Giveaway Ended: ${giveaway.prize}`)
        .setDescription('No winners recorded - implement entry tracking for production')
        .setColor(0xff0000);

      await channel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error(`Failed to end giveaway ${giveawayId}`, error);
    }
  }

  async getActiveGiveaways(guildId: string) {
    return prisma.giveaway.findMany({
      where: {
        guildId,
        ended: false,
        endsAt: {
          gt: new Date()
        }
      }
    });
  }
}
