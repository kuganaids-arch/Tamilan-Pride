import { prisma } from '@tamilanpride/database';
import { TextChannel, EmbedBuilder, Guild } from 'discord.js';
import { logger } from '../utils/logger';

export class LoggingService {
  async getLoggingConfig(guildId: string) {
    return prisma.loggingConfig.findUnique({
      where: { guildId }
    });
  }

  async setLoggingChannel(guildId: string, channelId: string, type: 'moderation' | 'message' | 'ticket') {
    const config = await this.getLoggingConfig(guildId);

    if (!config) {
      return prisma.loggingConfig.create({
        data: {
          guildId,
          enabled: true,
          ...(type === 'moderation' && { moderationLogsId: channelId }),
          ...(type === 'message' && { messageLogsId: channelId }),
          ...(type === 'ticket' && { ticketLogsId: channelId })
        }
      });
    }

    const updateData: any = { enabled: true };
    if (type === 'moderation') updateData.moderationLogsId = channelId;
    if (type === 'message') updateData.messageLogsId = channelId;
    if (type === 'ticket') updateData.ticketLogsId = channelId;

    return prisma.loggingConfig.update({
      where: { guildId },
      data: updateData
    });
  }

  async sendModerationLog(
    guild: Guild,
    embed: EmbedBuilder
  ) {
    try {
      const config = await this.getLoggingConfig(guild.id);
      if (!config?.enabled || !config.moderationLogsId) {
        return;
      }

      const channel = guild.channels.cache.get(config.moderationLogsId) as TextChannel | undefined;
      if (!channel || !channel.isSendable()) {
        return;
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to send moderation log for guild ${guild.id}`, error);
    }
  }

  async sendMessageLog(
    guild: Guild,
    embed: EmbedBuilder
  ) {
    try {
      const config = await this.getLoggingConfig(guild.id);
      if (!config?.enabled || !config.messageLogsId) {
        return;
      }

      const channel = guild.channels.cache.get(config.messageLogsId) as TextChannel | undefined;
      if (!channel || !channel.isSendable()) {
        return;
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to send message log for guild ${guild.id}`, error);
    }
  }

  async sendTicketLog(
    guild: Guild,
    embed: EmbedBuilder
  ) {
    try {
      const config = await this.getLoggingConfig(guild.id);
      if (!config?.enabled || !config.ticketLogsId) {
        return;
      }

      const channel = guild.channels.cache.get(config.ticketLogsId) as TextChannel | undefined;
      if (!channel || !channel.isSendable()) {
        return;
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to send ticket log for guild ${guild.id}`, error);
    }
  }
}
