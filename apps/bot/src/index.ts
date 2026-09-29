import { Client, Events, GuildMember } from 'discord.js';
import { prisma } from '@tamilanpride/database';
import { logger } from '../utils/logger';

export function registerGuildMemberRemove(client: Client) {
  client.on(Events.GuildMemberRemove, async (member: GuildMember) => {
    try {
      const guildSettings = await prisma.guildSettings.findUnique({
        where: { guildId: member.guild.id },
        select: { leaveChannelId: true }
      });

      if (!guildSettings?.leaveChannelId) {
        return;
      }

      const channel = member.guild.channels.cache.get(guildSettings.leaveChannelId);
      if (!channel || !('send' in channel)) {
        return;
      }

      const leaveText = `${member.user.username} has left ${member.guild.name}.`;
      await channel.send(leaveText);
      logger.info(`Leave message sent for ${member.user.id} in ${member.guild.id}`);
    } catch (error) {
      logger.error(`Failed to process guildMemberRemove for ${member.guild.id}`, error);
    }
  });
}
