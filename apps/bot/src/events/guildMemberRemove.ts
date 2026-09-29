import { Client, Events, GuildMember } from 'discord.js';
import { prisma } from '@tamilanpride/database';
import { logger } from '../utils/logger';

export function registerGuildMemberAdd(client: Client) {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      const guildSettings = await prisma.guildSettings.findUnique({
        where: { guildId: member.guild.id },
        select: { welcomeChannelId: true }
      });

      if (!guildSettings?.welcomeChannelId) {
        return;
      }

      const channel = member.guild.channels.cache.get(guildSettings.welcomeChannelId);
      if (!channel || !('send' in channel)) {
        return;
      }

      const welcomeText = `Welcome ${member.user.username} to ${member.guild.name}! We now have ${member.guild.memberCount} members.`;
      await channel.send(welcomeText);
      logger.info(`Welcome message sent for ${member.user.id} in ${member.guild.id}`);
    } catch (error) {
      logger.error(`Failed to process guildMemberAdd for ${member.guild.id}`, error);
    }
  });
}
