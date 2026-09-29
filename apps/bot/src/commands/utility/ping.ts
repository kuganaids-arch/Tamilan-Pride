import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from './command';
import { pingCommand } from './utility/ping';
import { helpCommand } from './utility/help';
import { serverCommand } from './utility/server';
import { userCommand } from './utility/user';
import { avatarCommand } from './utility/avatar';
import { botInfoCommand } from './utility/botinfo';

export const commandList: CommandDefinition[] = [
  pingCommand,
  helpCommand,
  serverCommand,
  userCommand,
  avatarCommand,
  botInfoCommand
];
