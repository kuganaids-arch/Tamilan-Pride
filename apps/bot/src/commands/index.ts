import { Client, Collection, ChatInputCommandInteraction, REST, Routes } from 'discord.js';
import { commandList } from '../commands';
import type { CommandDefinition } from '../commands/command';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class CommandHandler {
  private readonly commands = new Collection<string, CommandDefinition>();

  constructor(private readonly client: Client) {}

  async loadCommands() {
    for (const command of commandList) {
      this.commands.set(command.name, command);
    }

    logger.info(`Loaded ${this.commands.size} commands`);
    await this.registerGlobalCommands();
  }

  private async registerGlobalCommands() {
    const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
    const body = commandList.map((command) => command.data.toJSON());

    try {
      await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body });
      logger.info('Global slash commands registered');
    } catch (error) {
      logger.error('Failed to register slash commands', error);
    }
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const command = this.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Command failed: ${interaction.commandName}`, error);

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: '❌ Something went wrong while processing this command.\n\nError ID: ' + Math.random().toString(16).slice(2, 8).toUpperCase(),
          ephemeral: true
        });
        return;
      }

      await interaction.reply({
        content: '❌ Something went wrong while processing this command.\n\nError ID: ' + Math.random().toString(16).slice(2, 8).toUpperCase(),
        ephemeral: true
      });
    }
  }
}
