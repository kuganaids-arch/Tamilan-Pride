export type CommandDefinition = {
  name: string;
  description: string;
  cooldown?: number;
  permissions?: Array<string>;
  data: any;
  execute: (interaction: any) => Promise<void> | void;
};
