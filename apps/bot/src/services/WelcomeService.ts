import { prisma } from '@tamilanpride/database';
import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger';

export class WelcomeService {
  async getWelcomeConfig(guildId: string) {
    return prisma.welcomeConfig.findUnique({
      where: { guildId }
    });
  }

  async setWelcomeChannel(guildId: string, channelId: string) {
    return prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, channelId },
      update: { channelId, enabled: true }
    });
  }

  async setWelcomeMessage(guildId: string, message: string) {
    return prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, message },
      update: { message, enabled: true }
    });
  }

  async setWelcomeAutoRole(guildId: string, roleId: string) {
    return prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, autoRoleId: roleId },
      update: { autoRoleId: roleId, enabled: true }
    });
  }

  async sendWelcome(member: GuildMember) {
    try {
      const config = await this.getWelcomeConfig(member.guild.id);
      if (!config?.enabled || !config.channelId) {
        return;
      }

      const channel = member.guild.channels.cache.get(config.channelId) as TextChannel | undefined;
      if (!channel || !channel.isSendable()) {
        return;
      }

      const message = this.replacePlaceholders(config.message || '', member);
      await channel.send(message);

      // Auto role
      if (config.autoRoleId) {
        try {
          const role = member.guild.roles.cache.get(config.autoRoleId);
          if (role && member.manageable) {
            await member.roles.add(role);
          }
        } catch (error) {
          logger.warn(`Failed to assign auto role to ${member.id}`, error);
        }
      }
    } catch (error) {
      logger.error(`Failed to send welcome for ${member.id} in guild ${member.guild.id}`, error);
    }
  }

  private replacePlaceholders(message: string, member: GuildMember): string {
    return message
      .replace(/{user}/g, member.user.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{mention}/g, `<@${member.id}>`)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, String(member.guild.memberCount));
  }
}
