import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { ModerationService } from '../../services/ModerationService';
import { LoggingService } from '../../services/LoggingService';

const modService = new ModerationService();
const logService = new LoggingService();

export const kickCommand: CommandDefinition = {
  name: 'kick',
  description: 'Kick a member from the server.',
  permissions: ['KICK_MEMBERS'],
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((option) => option.setName('user').setDescription('The member to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for kick').setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user')!;
    const reason = interaction.options.getString('reason');

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({
        content: '❌ You do not have permission to kick members.',
        ephemeral: true
      });
      return;
    }

    try {
      const member = await interaction.guild!.members.fetch(targetUser.id);
      const moderationCase = await modService.kick(member, interaction.user.id, reason);

      const embed = new EmbedBuilder()
        .setTitle('Member Kicked')
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: false },
          { name: 'Case ID', value: moderationCase.id, inline: true }
        )
        .setColor(0xff7700);

      await interaction.reply({ embeds: [embed] });
      await logService.sendModerationLog(interaction.guild!, embed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to kick member';
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true
      });
    }
  }
};
