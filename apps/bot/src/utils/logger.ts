import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { BOT_NAME, BOT_VERSION } from '../../config/constants';

export const botInfoCommand: CommandDefinition = {
  name: 'botinfo',
  description: 'Show bot information.',
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Show bot information.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle(BOT_NAME)
      .setDescription('Advanced Discord Management')
      .addFields(
        { name: 'Version', value: BOT_VERSION, inline: true },
        { name: 'Library', value: 'discord.js v14', inline: true },
        { name: 'Runtime', value: 'Node.js 22+', inline: true },
        { name: 'Database', value: 'PostgreSQL + Prisma', inline: true },
        { name: 'Cache', value: 'Redis', inline: true }
      )
      .setColor(0xedb341);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
