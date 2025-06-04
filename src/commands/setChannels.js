import { SlashCommandBuilder } from 'discord.js';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./settings.db');

export default {
  data: new SlashCommandBuilder()
    .setName('set_channel')
    .setDescription('Configura los canales de traducción')
    .addChannelOption(option =>
      option.setName('spanish')
        .setDescription('Selecciona el canal para español')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('english')
        .setDescription('Selecciona el canal para inglés')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: '❌ Solo los administradores pueden ejecutar este comando.', ephemeral: true });
    }

    const spanishChannel = interaction.options.getChannel('spanish');
    const englishChannel = interaction.options.getChannel('english');

    db.run(`INSERT INTO servers (guild_id, spanish_channel, english_channel) VALUES (?, ?, ?) 
              ON CONFLICT(guild_id) DO UPDATE SET spanish_channel=?, english_channel=?`,
      [interaction.guild.id, spanishChannel.id, englishChannel.id, spanishChannel.id, englishChannel.id]);

    await interaction.reply(`✅ **Canales configurados:**  
        - **Español:** ${spanishChannel}  
        - **Inglés:** ${englishChannel}`);
  }
};
