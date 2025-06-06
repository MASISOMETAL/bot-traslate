import { SlashCommandBuilder } from 'discord.js';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./settings.db', (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos:", err.message);
    process.exit(1);
  }
});

// Convertir `db.run()` y `db.get()` en promesas para usar `await`
const dbRunAsync = promisify(db.run);
const dbGetAsync = promisify(db.get);

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

    try {
      // 🔎 Verificar si la configuración ya existe
      const existingConfig = await dbGetAsync("SELECT spanish_channel, english_channel FROM servers WHERE guild_id = ?", [interaction.guild.id]);

      if (existingConfig) {
        return interaction.reply({ content: '⚠️ Los canales ya están configurados. Usa `/set_channel` nuevamente para actualizar.', ephemeral: true });
      }

      // 💾 Insertar o actualizar la configuración
      await dbRunAsync(`INSERT INTO servers (guild_id, spanish_channel, english_channel) VALUES (?, ?, ?) 
                        ON CONFLICT(guild_id) DO UPDATE SET spanish_channel=?, english_channel=?`,
        [interaction.guild.id, spanishChannel.id, englishChannel.id, spanishChannel.id, englishChannel.id]);

      await interaction.reply(`✅ **Canales configurados correctamente:**  
        - **Español:** ${spanishChannel}  
        - **Inglés:** ${englishChannel}`);

      // 🛑 Cerrar la base de datos después de ejecutar el comando
      db.close((err) => {
        if (err) {
          console.error("❌ Error al cerrar la base de datos:", err.message);
        }
      });

    } catch (error) {
      console.error("❌ Error al actualizar canales:", error);
      await interaction.reply({ content: '❌ Hubo un problema al configurar los canales.', ephemeral: true });
    }
  }
};
