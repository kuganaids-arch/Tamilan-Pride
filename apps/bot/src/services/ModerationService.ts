import { prisma } from '@tamilanpride/database';
import { GuildMember, User, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from '../utils/logger';

export interface ModerationCaseData {
  guildId: string;
  userId: string;
  moderator: string;
  action: 'ban' | 'kick' | 'timeout' | 'untimeout' | 'warn' | 'purge' | 'softban';
  reason?: string;
  duration?: string;
}

export class ModerationService {
  async ban(
    member: GuildMember,
    moderatorId: string,
    reason?: string,
    deleteMessageDays?: number
  ) {
    const guildId = member.guild.id;

    // Validation
    if (member.user.bot) {
      throw new Error('Cannot ban a bot.');
    }

    if (!member.bannable) {
      throw new Error('I do not have permission to ban this member.');
    }

    if (
      member.guild.members.me &&
      member.roles.highest.position >= member.guild.members.me.roles.highest.position
    ) {
      throw new Error('I cannot ban a member with a role equal to or higher than mine.');
    }

    // Execute ban
    await member.ban({
      reason: reason || 'No reason provided',
      deleteMessageSeconds: (deleteMessageDays || 0) * 86400
    });

    // Create case
    const moderationCase = await this.createCase({
      guildId,
      userId: member.id,
      moderator: moderatorId,
      action: 'ban',
      reason,
      duration: undefined
    });

    // Attempt DM
    try {
      const embed = new EmbedBuilder()
        .setTitle('You have been banned')
        .setDescription(`From: ${member.guild.name}`)
        .addFields(
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Moderator', value: `<@${moderatorId}>`, inline: false }
        )
        .setColor(0xff0000);

      await member.user.send({ embeds: [embed] });
    } catch {
      logger.warn(`Could not DM ${member.id} about ban`);
    }

    return moderationCase;
  }

  async kick(
    member: GuildMember,
    moderatorId: string,
    reason?: string
  ) {
    const guildId = member.guild.id;

    // Validation
    if (member.user.bot) {
      throw new Error('Cannot kick a bot.');
    }

    if (!member.kickable) {
      throw new Error('I do not have permission to kick this member.');
    }

    if (
      member.guild.members.me &&
      member.roles.highest.position >= member.guild.members.me.roles.highest.position
    ) {
      throw new Error('I cannot kick a member with a role equal to or higher than mine.');
    }

    // Execute kick
    await member.kick(reason || 'No reason provided');

    // Create case
    const moderationCase = await this.createCase({
      guildId,
      userId: member.id,
      moderator: moderatorId,
      action: 'kick',
      reason,
      duration: undefined
    });

    // Attempt DM
    try {
      const embed = new EmbedBuilder()
        .setTitle('You have been kicked')
        .setDescription(`From: ${member.guild.name}`)
        .addFields(
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Moderator', value: `<@${moderatorId}>`, inline: false }
        )
        .setColor(0xff7700);

      await member.user.send({ embeds: [embed] });
    } catch {
      logger.warn(`Could not DM ${member.id} about kick`);
    }

    return moderationCase;
  }

  async timeout(
    member: GuildMember,
    moderatorId: string,
    durationMs: number,
    reason?: string
  ) {
    const guildId = member.guild.id;

    if (member.user.bot) {
      throw new Error('Cannot timeout a bot.');
    }

    if (!member.moderatable) {
      throw new Error('I do not have permission to timeout this member.');
    }

    if (
      member.guild.members.me &&
      member.roles.highest.position >= member.guild.members.me.roles.highest.position
    ) {
      throw new Error('I cannot timeout a member with a role equal to or higher than mine.');
    }

    // Discord max timeout is 28 days
    const maxMs = 28 * 24 * 60 * 60 * 1000;
    if (durationMs > maxMs) {
      throw new Error('Timeout duration cannot exceed 28 days.');
    }

    await member.timeout(durationMs, reason || 'No reason provided');

    const durationStr = this.formatDuration(durationMs);
    const moderationCase = await this.createCase({
      guildId,
      userId: member.id,
      moderator: moderatorId,
      action: 'timeout',
      reason,
      duration: durationStr
    });

    try {
      const embed = new EmbedBuilder()
        .setTitle('You have been timed out')
        .setDescription(`In: ${member.guild.name}`)
        .addFields(
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Moderator', value: `<@${moderatorId}>`, inline: false }
        )
        .setColor(0xffff00);

      await member.user.send({ embeds: [embed] });
    } catch {
      logger.warn(`Could not DM ${member.id} about timeout`);
    }

    return moderationCase;
  }

  async untimeout(
    member: GuildMember,
    moderatorId: string,
    reason?: string
  ) {
    const guildId = member.guild.id;

    if (!member.moderatable) {
      throw new Error('I do not have permission to remove timeout from this member.');
    }

    await member.timeout(null, reason || 'No reason provided');

    const moderationCase = await this.createCase({
      guildId,
      userId: member.id,
      moderator: moderatorId,
      action: 'untimeout',
      reason,
      duration: undefined
    });

    return moderationCase;
  }

  async warn(
    guildId: string,
    userId: string,
    moderatorId: string,
    reason?: string
  ) {
    const warning = await prisma.warning.create({
      data: {
        guildId,
        userId,
        moderator: moderatorId,
        reason: reason || null
      }
    });

    await this.createCase({
      guildId,
      userId,
      moderator: moderatorId,
      action: 'warn',
      reason,
      duration: undefined
    });

    return warning;
  }

  async getWarnings(guildId: string, userId: string) {
    return prisma.warning.findMany({
      where: {
        guildId,
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async clearWarnings(guildId: string, userId: string) {
    const result = await prisma.warning.deleteMany({
      where: {
        guildId,
        userId
      }
    });

    return result.count;
  }

  async purge(channel: TextChannel, amount: number, moderatorId: string, guildId: string) {
    if (amount < 1 || amount > 100) {
      throw new Error('You can only purge between 1 and 100 messages.');
    }

    const messages = await channel.messages.fetch({ limit: amount });
    await channel.bulkDelete(messages, true);

    await this.createCase({
      guildId,
      userId: 'System',
      moderator: moderatorId,
      action: 'purge',
      reason: `Purged ${messages.size} messages`,
      duration: undefined
    });

    return messages.size;
  }

  async createCase(data: ModerationCaseData) {
    return prisma.moderationCase.create({
      data: {
        guildId: data.guildId,
        userId: data.userId,
        moderator: data.moderator,
        action: data.action,
        reason: data.reason || null,
        duration: data.duration || null
      }
    });
  }

  async getCases(guildId: string, userId?: string) {
    return prisma.moderationCase.findMany({
      where: {
        guildId,
        ...(userId && { userId })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  parseDuration(input: string): number {
    const match = input.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid duration format. Use: 10s, 5m, 1h, 1d');
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid duration unit.');
    }
  }
}
