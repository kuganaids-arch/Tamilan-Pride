import { Client, Events, Guild } from 'discord.js';
import { GuildService } from '../services/GuildService';
import { logger } from '../utils/logger';

const guildService = new GuildService();

export function registerGuildCreate(client: Client) {
  client.on(Events.GuildCreate, async (guild: Guild) => {
    try {
      await guildService.ensureGuild(guild.id, guild.name);
      logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    } catch (error) {
      logger.error(`Failed to initialize guild ${guild.id}`, error);
    }
  });
}
