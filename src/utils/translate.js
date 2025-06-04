import fetch from 'node-fetch';

export async function translateMessage(text, targetLanguage) {
  try {
    const sourceLang = targetLanguage === 'en' ? 'es' : 'en'; // Detectar idioma de origen

    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLanguage}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    // Verificar si la traducción es válida
    if (!data.responseData || !data.responseData.translatedText) {
      throw new Error("No se recibió una traducción válida.");
    }

    return data.responseData.translatedText;
  } catch (error) {
    console.error('❌ Error en la traducción con MyMemory API:', error);
    return 'Error al traducir el mensaje.';
  }
}
