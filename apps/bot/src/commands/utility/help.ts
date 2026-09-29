import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { CommandDefinition } from '../command';

export const pingCommand: CommandDefinition = {
  name: 'ping',
  description: 'Check the bot latency.',
  cooldown: 3000,
  data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const start = Date.now();
    await interaction.reply({ content: '🏓 Pinging...', ephemeral: true });
    const latency = Date.now() - start;
    await interaction.editReply({ content: `🏓 Pong! Latency: ${latency}ms` });
  }
};
