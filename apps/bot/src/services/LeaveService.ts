import { prisma } from '@tamilanpride/database';
import { User, Guild, TextChannel } from 'discord.js';
import { logger } from '../utils/logger';

export class LeaveService {
  async getLeaveConfig(guildId: string) {
    return prisma.leaveConfig.findUnique({
      where: { guildId }
    });
  }

  async setLeaveChannel(guildId: string, channelId: string) {
    return prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, channelId },
      update: { channelId, enabled: true }
    });
  }

  async setLeaveMessage(guildId: string, message: string) {
    return prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, message },
      update: { message, enabled: true }
    });
  }

  async sendLeave(user: User, guild: Guild) {
    try {
      const config = await this.getLeaveConfig(guild.id);
      if (!config?.enabled || !config.channelId) {
        return;
      }

      const channel = guild.channels.cache.get(config.channelId) as TextChannel | undefined;
      if (!channel || !channel.isSendable()) {
        return;
      }

      const message = this.replacePlaceholders(config.message || '', user, guild);
      await channel.send(message);
    } catch (error) {
      logger.error(`Failed to send leave message for ${user.id} in guild ${guild.id}`, error);
    }
  }

  private replacePlaceholders(message: string, user: User, guild: Guild): string {
    return message
      .replace(/{user}/g, user.toString())
      .replace(/{username}/g, user.username)
      .replace(/{mention}/g, `<@${user.id}>`)
      .replace(/{server}/g, guild.name)
      .replace(/{membercount}/g, String(guild.memberCount));
  }
}
