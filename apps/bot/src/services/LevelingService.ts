import { prisma } from '@tamilanpride/database';
import { Message, EmbedBuilder } from 'discord.js';
import { redisService } from './RedisService';
import { logger } from '../utils/logger';

interface UserXP {
  guildId: string;
  userId: string;
  xp: number;
  level: number;
}

export class LevelingService {
  async awardXP(message: Message, xpAmount: number = 10) {
    if (message.author.bot || !message.guild) {
      return;
    }

    const guildId = message.guild.id;
    const userId = message.author.id;

    const config = await prisma.levelingConfig.findUnique({
      where: { guildId }
    });

    if (!config?.enabled) {
      return;
    }

    // Check cooldown
    const cooldownKey = `xp:${guildId}:${userId}`;
    const onCooldown = await redisService.get(cooldownKey);
    if (onCooldown) {
      return;
    }

    await redisService.set(cooldownKey, 'true', Math.floor(config.cooldownMs / 1000));

    // Store XP (in production, use a dedicated User/Level model)
    const xpKey = `userxp:${guildId}:${userId}`;
    const currentXp = parseInt(await redisService.get(xpKey) || '0', 10);
    const newXp = currentXp + xpAmount;

    await redisService.set(xpKey, String(newXp));

    const level = this.calculateLevel(newXp);
    const previousLevel = this.calculateLevel(currentXp);

    if (level > previousLevel) {
      const embed = new EmbedBuilder()
        .setTitle(`🎉 Level Up!`)
        .setDescription(`${message.author} reached level ${level}`)
        .setColor(0x57f287);

      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } }).catch(() => {});
    }
  }

  async getLevel(guildId: string, userId: string): Promise<number> {
    const xpKey = `userxp:${guildId}:${userId}`;
    const xp = parseInt(await redisService.get(xpKey) || '0', 10);
    return this.calculateLevel(xp);
  }

  async getLeaderboard(guildId: string, limit: number = 10): Promise<UserXP[]> {
    // This is simplified - in production use a dedicated model or periodic database sync
    return [];
  }

  private calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }
}
