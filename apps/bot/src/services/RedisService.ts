import { prisma } from '@tamilanpride/database';

export class LoggingService {
  async getGuildLogChannel(guildId: string) {
    const settings = await prisma.guildSettings.findUnique({
      where: { guildId },
      select: { moderationLogId: true }
    });

    return settings?.moderationLogId ?? null;
  }
}
