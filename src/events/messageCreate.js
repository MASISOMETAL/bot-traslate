import sqlite3 from 'sqlite3';
import { translateMessage } from '../utils/translate.js';

const db = new sqlite3.Database('./settings.db');

export async function handleMessage(message) {
  if (message.author.bot) return;

  db.get("SELECT spanish_channel, english_channel FROM servers WHERE guild_id = ?", [message.guild.id], async (err, row) => {
    if (err) {
      console.error("❌ Error al consultar la base de datos:", err);
      return;
    }
    if (!row) return;

    const { spanish_channel, english_channel } = row;
    let targetChannelId, targetLanguage;

    if (message.channel.id === spanish_channel) {
      targetChannelId = english_channel;
      targetLanguage = 'en';
    } else if (message.channel.id === english_channel) {
      targetChannelId = spanish_channel;
      targetLanguage = 'es';
    }

    // 🔍 Verificar si el canal de destino existe
    const targetChannel = message.guild.channels.cache.get(targetChannelId);
    if (!targetChannel && (spanish_channel || english_channel)) {
      console.warn(`⚠️ Falta un canal de traducción configurado.`);
      return message.channel.send("⚠️ Uno de los canales de traducción ha sido eliminado. Usa `/set_channel` para actualizar la configuración.");
    }

    // 📷 Si el mensaje contiene imágenes, enviarlas al canal de destino
    if (message.attachments.size > 0) {
      const username = message.member ? message.member.displayName : message.author.username;

      targetChannel.send({
        content: `**${username}** ha enviado una imagen:`,
        files: message.attachments.map(attachment => attachment.url)
      });

      return; // No intentar traducir imágenes
    }

    if (!targetChannelId) return;

    // 📝 Si el mensaje es solo texto, traducirlo normalmente
    const translatedText = await translateMessage(message.content, targetLanguage);
    const username = message.member ? message.member.displayName : message.author.username;

    targetChannel.send(`**${username}**: ${translatedText}`);
  });
}
