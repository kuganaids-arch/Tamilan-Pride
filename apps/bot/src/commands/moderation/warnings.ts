import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';

const modService = new ModerationService();

export const warningsCommand: CommandDefinition = {
  name: 'warnings',
  description: 'Check warnings for a member.',
  permissions: ['MODERATE_MEMBERS'],
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check warnings for a member.')
    .addUserOption((option) => option.setName('user').setDescription('The member to check').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user')!;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: '❌ You do not have permission to view warnings.',
        ephemeral: true
      });
      return;
    }

    try {
      const warnings = await modService.getWarnings(interaction.guildId!, targetUser.id);

      if (warnings.length === 0) {
        await interaction.reply({
          content: `${targetUser.username} has no warnings.`,
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Warnings for ${targetUser.username}`)
        .setColor(0xffa500);

      for (let i = 0; i < Math.min(warnings.length, 10); i++) {
        const warning = warnings[i];
        embed.addFields({
          name: `Warning ${i + 1}`,
          value: `Reason: ${warning.reason || 'No reason provided'}\nModerator: <@${warning.moderator}>\nDate: <t:${Math.floor(warning.createdAt.getTime() / 1000)}:F>`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch warnings';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
