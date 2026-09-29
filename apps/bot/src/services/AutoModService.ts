import { prisma } from '@tamilanpride/database';
import { Message, EmbedBuilder } from 'discord.js';
import { redisService } from './RedisService';
import { logger } from '../utils/logger';

const BAD_WORDS = ['badword1', 'badword2']; // Placeholder - implement actual filter
const INVITE_REGEX = /discord(?:\.gg|\.com\/invite)\//gi;

export class AutoModService {
  async checkMessage(message: Message) {
    if (message.author.bot || !message.guild) {
      return;
    }

    const guildId = message.guild.id;
    const config = await prisma.autoModConfig.findUnique({
      where: { guildId }
    });

    if (!config?.enabled) {
      return;
    }

    const content = message.content.toLowerCase();

    // Check invites
    if (config.invites && INVITE_REGEX.test(content)) {
      await this.handleViolation(message, 'invite', config);
      return;
    }

    // Check caps spam
    if (config.capsSpam && this.isCapsSpam(content)) {
      await this.handleViolation(message, 'caps', config);
      return;
    }

    // Check spam
    if (config.spamEnabled) {
      const isSpam = await this.checkSpam(message);
      if (isSpam) {
        await this.handleViolation(message, 'spam', config);
        return;
      }
    }
  }

  private async handleViolation(message: Message, type: string, config: any) {
    try {
      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setTitle('⚠️ Message Removed')
        .setDescription(`Your message was removed for: ${type}`)
        .setColor(0xff7700);

      await message.author.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error(`AutoMod violation handling failed`, error);
    }
  }

  private isCapsSpam(content: string): boolean {
    if (content.length < 10) return false;
    const caps = (content.match(/[A-Z]/g) || []).length;
    return (caps / content.length) > 0.7;
  }

  private async checkSpam(message: Message): Promise<boolean> {
    const key = `spam:${message.guild!.id}:${message.author.id}`;
    const current = await redisService.get(key);
    const count = (parseInt(current || '0', 10)) + 1;

    await redisService.set(key, String(count), 10);

    return count > 5;
  }
}
