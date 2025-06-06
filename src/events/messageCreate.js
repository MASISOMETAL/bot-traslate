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

    const targetChannel = message.guild.channels.cache.get(targetChannelId);
    if (!targetChannel && (spanish_channel || english_channel)) {
      console.warn(`⚠️ Falta un canal de traducción configurado.`);
      return message.channel.send("⚠️ Uno de los canales de traducción ha sido eliminado. Usa `/set_channel` para actualizar la configuración.");
    }

    const username = message.member ? message.member.displayName : message.author.username;

    if (!targetChannelId) return;

    // 📝 Si hay texto, traducirlo
    let translatedText = "";
    if (message.content.trim().length > 0) {
      translatedText = await translateMessage(message.content, targetLanguage);
      if (translatedText.includes("NO QUERY SPECIFIED")) translatedText = ""; // Evita errores de traducción
    }

    // 📷 Si el mensaje tiene imágenes, enviarlas con el texto traducido (si hay)
    const files = message.attachments.size > 0 ? message.attachments.map(attachment => attachment.url) : [];

    if (translatedText || files.length > 0) {
      targetChannel.send({
        content: translatedText ? `**${username}**: ${translatedText}` : `**${username}** ha enviado una imagen:`,
        files: files.length > 0 ? files : undefined
      });
    }
  });
}
