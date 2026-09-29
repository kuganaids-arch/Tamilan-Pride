import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { CommandDefinition } from '../command';

export const userCommand: CommandDefinition = {
  name: 'user',
  description: 'Show info about a Discord user.',
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Show info about a Discord user.')
    .addUserOption((option) => option.setName('target').setDescription('The user to inspect').setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target') ?? interaction.user;
    const member = interaction.guild?.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setTitle(target.username)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'User ID', value: target.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Nickname', value: member?.nickname ?? 'None', inline: true }
      )
      .setColor(0x57f287);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
