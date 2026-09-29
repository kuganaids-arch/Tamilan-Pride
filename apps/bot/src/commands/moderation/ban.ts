import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';
import { LoggingService } from '../../services/LoggingService';

const modService = new ModerationService();
const logService = new LoggingService();

export const banCommand: CommandDefinition = {
  name: 'ban',
  description: 'Ban a member from the server.',
  permissions: ['BAN_MEMBERS'],
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .addUserOption((option) => option.setName('user').setDescription('The member to ban').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addIntegerOption((option) =>
      option.setName('delete-message-days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;
    const targetUser = interaction.options.getUser('user')!;
    const reason = interaction.options.getString('reason');
    const deleteMessageDays = interaction.options.getInteger('delete-message-days') || 0;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: '❌ You do not have permission to ban members.',
        ephemeral: true
      });
      return;
    }

    try {
      const member = await interaction.guild!.members.fetch(targetUser.id);
      const moderationCase = await modService.ban(member, interaction.user.id, reason, deleteMessageDays);

      const embed = new EmbedBuilder()
        .setTitle('Member Banned')
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Case ID', value: moderationCase.id, inline: true }
        )
        .setColor(0xff0000);

      await interaction.reply({ embeds: [embed] });

      // Log
      await logService.sendModerationLog(interaction.guild!, embed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to ban member';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
