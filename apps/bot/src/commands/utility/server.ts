import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { CommandDefinition } from '../command';
import { commandList } from '../index';

export const helpCommand: CommandDefinition = {
  name: 'help',
  description: 'Show available commands.',
  data: new SlashCommandBuilder().setName('help').setDescription('Show available commands.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const commands = commandList
      .map((command) => `</${command.name}:${command.name}>`)
      .join(', ');

    await interaction.reply({
      content: `🤖 Tamilan Pride command list\n\n${commands}`,
      ephemeral: true
    });
  }
};
