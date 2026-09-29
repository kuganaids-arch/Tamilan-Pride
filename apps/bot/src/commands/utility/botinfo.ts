import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { CommandDefinition } from '../command';

export const avatarCommand: CommandDefinition = {
  name: 'avatar',
  description: 'Show a user avatar.',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user avatar.')
    .addUserOption((option) => option.setName('target').setDescription('The user whose avatar you want to see').setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('target') ?? interaction.user;
    await interaction.reply({ content: user.displayAvatarURL({ size: 1024, extension: 'png' }), ephemeral: true });
  }
};
