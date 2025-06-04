import sqlite3 from 'sqlite3';
import { translateMessage } from '../utils/translate.js';

const db = new sqlite3.Database('./settings.db');

export async function handleMessage(message) {
  if (message.author.bot) return;

  db.get("SELECT spanish_channel, english_channel FROM servers WHERE guild_id = ?", [message.guild.id], async (err, row) => {
    if (err || !row) return;

    const { spanish_channel, english_channel } = row;
    let targetChannelId, targetLanguage;

    if (message.channel.id === spanish_channel) {
      targetChannelId = english_channel;
      targetLanguage = 'en';
    } else if (message.channel.id === english_channel) {
      targetChannelId = spanish_channel;
      targetLanguage = 'es';
    }

    if (targetChannelId) {
      const translatedText = await translateMessage(message.content, targetLanguage);
      const targetChannel = message.guild.channels.cache.get(targetChannelId);

      const username = message.member ? message.member.displayName : message.author.username;

      if (targetChannel) {
        targetChannel.send(`**${username}**: ${translatedText}`);
      }
    }
  });
}
