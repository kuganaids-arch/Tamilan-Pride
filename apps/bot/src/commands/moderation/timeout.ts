import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';
import { LoggingService } from '../../services/LoggingService';

const modService = new ModerationService();
const logService = new LoggingService();

export const timeoutCommand: CommandDefinition = {
  name: 'timeout',
  description: 'Timeout a member.',
  permissions: ['MODERATE_MEMBERS'],
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member.')
    .addUserOption((option) => option.setName('user').setDescription('The member to timeout').setRequired(true))
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration (e.g., 10m, 1h, 1d)')
        .setRequired(true)
        .addChoices(
          { name: '10 seconds', value: '10s' },
          { name: '1 minute', value: '1m' },
          { name: '5 minutes', value: '5m' },
          { name: '10 minutes', value: '10m' },
          { name: '1 hour', value: '1h' },
          { name: '1 day', value: '1d' },
          { name: '7 days', value: '7d' }
        )
    )
    .addStringOption((option) => option.setName('reason').setDescription('Reason for timeout').setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user')!;
    const durationStr = interaction.options.getString('duration')!;
    const reason = interaction.options.getString('reason');

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: '❌ You do not have permission to timeout members.',
        ephemeral: true
      });
      return;
    }

    try {
      const member = await interaction.guild!.members.fetch(targetUser.id);
      const durationMs = modService.parseDuration(durationStr);
      const moderationCase = await modService.timeout(member, interaction.user.id, durationMs, reason);

      const embed = new EmbedBuilder()
        .setTitle('Member Timed Out')
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Case ID', value: moderationCase.id, inline: true }
        )
        .setColor(0xffff00);

      await interaction.reply({ embeds: [embed] });
      await logService.sendModerationLog(interaction.guild!, embed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to timeout member';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
