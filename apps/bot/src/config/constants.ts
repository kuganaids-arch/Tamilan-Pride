export const DISCORD_INTENTS = [
  'Guilds',
  'GuildMembers',
  'GuildBans',
  'GuildEmojisAndStickers',
  'GuildIntegrations',
  'GuildInvites',
  'GuildVoiceStates',
  'GuildMessages',
  'GuildMessageReactions',
  'GuildMessageTyping',
  'DirectMessages',
  'DirectMessageReactions',
  'DirectMessageTyping',
  'MessageContent',
  'GuildScheduledEvents'
] as const;

export const DISCORD_PARTIALS = ['Channel', 'Message', 'User', 'GuildMember', 'Reaction'] as const;

export const DEFAULT_PREFIX = '/';
export const BOT_NAME = 'Tamilan Pride';
export const BOT_VERSION = '1.0.0';

export const COOLDOWN_TIMES = {
  DEFAULT: 3000,
  MODERATION: 1000,
  LEVELING: 60000
} as const;
