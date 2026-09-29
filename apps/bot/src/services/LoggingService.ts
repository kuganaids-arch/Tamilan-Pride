import { prisma } from '@tamilanpride/database';

export class ModerationService {
  async createCase(data: {
    guildId: string;
    userId: string;
    moderator: string;
    action: string;
    reason?: string;
    duration?: string;
  }) {
    return prisma.moderationCase.create({
      data: {
        guildId: data.guildId,
        userId: data.userId,
        moderator: data.moderator,
        action: data.action,
        reason: data.reason ?? null,
        duration: data.duration ?? null
      }
    });
  }
}
