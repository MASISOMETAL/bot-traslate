import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { registerCommands } from './src/utils/registerCommands.js';
import { readdirSync } from 'fs';
import sqlite3 from 'sqlite3';

// Cargar variables del archivo .env
dotenv.config();

const db = new sqlite3.Database('./settings.db', (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos:", err.message);
    process.exit(1); // Salir si no se puede acceder a la base de datos
  }
});

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS servers (
    guild_id TEXT PRIMARY KEY,
    spanish_channel TEXT,
    english_channel TEXT
)`, (err) => {
  if (err) console.error("❌ Error al crear la tabla:", err.message);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// 📂 Cargar comandos
const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));
const commands = new Map();

for (const file of commandFiles) {
  const { default: command } = await import(`./src/commands/${file}`);
  commands.set(command.data.name, command);
}

if (commands.size === 0) {
  console.warn("⚠️ No hay comandos registrados.");
}

// 🚀 Cuando el bot está listo
client.once('ready', () => {
  console.log(`✅ Bot activo como ${client.user.tag}`);
  registerCommands(client);
});

// 📝 Manejo de comandos Slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error ejecutando ${interaction.commandName}:`, error);
    await interaction.reply({ content: '❌ Hubo un error al ejecutar el comando.', ephemeral: true });
  }
});

// 📝 Manejo de mensajes normales
import { handleMessage } from './src/events/messageCreate.js';
client.on('messageCreate', handleMessage);

// 🔑 Iniciar sesión con el token
client.login(process.env.TOKEN);

const version = 1.1;

// Server Dummy

import http from "http"

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('El bot está funcionando.\n');
});

// Configurar el puerto
const PORT = process.env.PORT || 2400;
server.listen(PORT, () => {
  console.log(`Servidor web nativo corriendo en el puerto ${PORT}`);
});