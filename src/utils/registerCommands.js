import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export async function registerCommands(client) {
  const commands = [];
  const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const { default: command } = await import(`../commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('🔄 Registrando comandos con Discord...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Comandos registrados correctamente.');
  } catch (error) {
    console.error('❌ Error al registrar los comandos:', error);
  }
}
