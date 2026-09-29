import { prisma } from '@tamilanpride/database';

export class GuildSettingsService {
  async setWelcomeChannel(guildId: string, channelId: string) {
    return prisma.guildSettings.upsert({
      where: { guildId },
      create: { guildId, welcomeChannelId: channelId },
      update: { welcomeChannelId: channelId }
    });
  }

  async setLoggingChannel(guildId: string, channelId: string) {
    return prisma.guildSettings.upsert({
      where: { guildId },
      create: { guildId, moderationLogId: channelId },
      update: { moderationLogId: channelId }
    });
  }
}
