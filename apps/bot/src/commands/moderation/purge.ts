import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';

const modService = new ModerationService();

export const purgeCommand: CommandDefinition = {
  name: 'purge',
  description: 'Delete messages in bulk.',
  permissions: ['MANAGE_MESSAGES'],
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages in bulk.')
    .addIntegerOption((option) =>
      option.setName('amount').setDescription('Number of messages to delete').setMinValue(1).setMaxValue(100).setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('amount')!;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: '❌ You do not have permission to manage messages.',
        ephemeral: true
      });
      return;
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: '❌ This command can only be used in text channels.',
        ephemeral: true
      });
      return;
    }

    try {
      const deleted = await modService.purge(interaction.channel, amount, interaction.user.id, interaction.guildId!);

      const embed = new EmbedBuilder()
        .setTitle('Messages Purged')
        .setDescription(`Deleted ${deleted} message(s).`)
        .setColor(0x57f287);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to purge messages';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
