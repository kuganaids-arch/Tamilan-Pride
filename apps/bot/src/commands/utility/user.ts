import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';
import { GuildService } from '../../services/GuildService';

const guildService = new GuildService();

export const serverCommand: CommandDefinition = {
  name: 'server',
  description: 'View information about the current server.',
  data: new SlashCommandBuilder().setName('server').setDescription('View information about the current server.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    await guildService.ensureGuild(guild.id, guild.name);

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name}`)
      .setDescription('Server information')
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true }
      )
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
