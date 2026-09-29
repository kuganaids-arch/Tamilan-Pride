import { prisma } from '@tamilanpride/database';

export class GuildService {
  async ensureGuild(guildId: string, name?: string) {
    if (!guildId) {
      throw new Error('guildId is required');
    }

    const guild = await prisma.guild.upsert({
      where: { guildId },
      update: { name: name ?? undefined },
      create: { guildId, name: name ?? 'Unknown Guild' }
    });

    await prisma.guildSettings.upsert({
      where: { guildId },
      create: { guildId },
      update: {}
    });

    return guild;
  }

  async getGuild(guildId: string) {
    return prisma.guild.findUnique({
      where: { guildId },
      include: { settings: true }
    });
  }

  async getGuildSettings(guildId: string) {
    return prisma.guildSettings.findUnique({
      where: { guildId }
    });
  }
}
