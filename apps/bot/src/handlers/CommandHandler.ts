import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import { connectDatabase, disconnectDatabase } from '@tamilanpride/database';
import { env } from './config/env';
import { CommandHandler } from './handlers/CommandHandler';
import { logger } from './utils/logger';
import { redisService } from './services/RedisService';
import { registerGuildCreate } from './events/guildCreate';
import { registerGuildMemberAdd } from './events/guildMemberAdd';
import { registerGuildMemberRemove } from './events/guildMemberRemove';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

const commandHandler = new CommandHandler(client);

async function startBot() {
  try {
    await connectDatabase();
    await redisService.connect();
    await commandHandler.loadCommands();

    registerGuildCreate(client);
    registerGuildMemberAdd(client);
    registerGuildMemberRemove(client);

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }

      await commandHandler.execute(interaction);
    });

    client.on(Events.ClientReady, () => {
      logger.info(`Tamilan Pride is online as ${client.user?.tag}`);
    });

    client.on(Events.Error, (error) => {
      logger.error('Client error', error);
    });

    client.on(Events.ShardDisconnect, () => {
      logger.warn('Discord connection closed');
    });

    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    logger.error('Bot failed to start', error);
    await disconnectDatabase();
    await redisService.disconnect();
    process.exit(1);
  }
}

void startBot();

process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down...');
  await redisService.disconnect();
  await disconnectDatabase();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Gracefully shutting down...');
  await redisService.disconnect();
  await disconnectDatabase();
  client.destroy();
  process.exit(0);
});
