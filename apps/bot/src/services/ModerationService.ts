import { PermissionFlagsBits } from 'discord.js';

export class PermissionService {
  async hasAdmin(interaction: any) {
    return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
  }

  async hasManageGuild(interaction: any) {
    return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false;
  }
}
