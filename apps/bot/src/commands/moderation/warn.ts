import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';

const modService = new ModerationService();

export const warnCommand: CommandDefinition = {
  name: 'warn',
  description: 'Warn a member.',
  permissions: ['MODERATE_MEMBERS'],
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member.')
    .addUserOption((option) => option.setName('user').setDescription('The member to warn').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for warning').setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user')!;
    const reason = interaction.options.getString('reason');

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: '❌ You do not have permission to warn members.',
        ephemeral: true
      });
      return;
    }

    try {
      const warning = await modService.warn(interaction.guildId!, targetUser.id, interaction.user.id, reason);

      const embed = new EmbedBuilder()
        .setTitle('Member Warned')
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: false }
        )
        .setColor(0xffa500);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to warn member';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
