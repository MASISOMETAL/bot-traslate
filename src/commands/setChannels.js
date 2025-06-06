import { SlashCommandBuilder } from 'discord.js';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./settings.db', (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos:", err.message);
    process.exit(1);
  }
});

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

    // 🔎 Verificar si ya existe una configuración
    db.get("SELECT spanish_channel, english_channel FROM servers WHERE guild_id = ?", [interaction.guild.id], (err, row) => {
      if (err) {
        console.error("❌ Error al consultar la base de datos:", err);
        return interaction.reply({ content: '❌ Hubo un problema al acceder a la base de datos.', ephemeral: true });
      }

      if (row) {
        return interaction.reply({ content: '⚠️ Los canales ya están configurados. Usa `/set_channel` nuevamente para actualizar.', ephemeral: true });
      }

      // 💾 Insertar o actualizar configuración
      db.run(`INSERT INTO servers (guild_id, spanish_channel, english_channel) VALUES (?, ?, ?) 
              ON CONFLICT(guild_id) DO UPDATE SET spanish_channel=?, english_channel=?`,
        [interaction.guild.id, spanishChannel.id, englishChannel.id, spanishChannel.id, englishChannel.id],
        (err) => {
          if (err) {
            console.error("❌ Error al guardar la configuración en la base de datos:", err);
            return interaction.reply({ content: '❌ Hubo un problema al configurar los canales.', ephemeral: true });
          }

          interaction.reply(`✅ **Canales configurados correctamente:**  
        - **Español:** ${spanishChannel}  
        - **Inglés:** ${englishChannel}`);
        });
    });
  }
};
