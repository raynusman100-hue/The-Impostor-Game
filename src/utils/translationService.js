/**
 * Translation service using MyMemory Translation API (free, no API key needed)
 * Supports multiple languages including Malayalam
 */

const TRANSLATION_API = 'https://api.mymemory.translated.net/get';

/**
 * Translate text from English to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'ml' for Malayalam, 'hi' for Hindi)
 * @returns {Promise<string>} Translated text
 */
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

/**
 * Fetch with timeout to prevent hanging on slow/disconnected networks
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds (default: 10000ms = 10s)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your internet connection');
        }
        throw error;
    }
}

/**
 * Translate text from English to target language
 * Uses Google Translate (GTX) as primary, falls back to MyMemory
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang = 'en') {
    // If target is English or text is empty, return as-is
    if (targetLang === 'en' || !targetLang || !text || text.trim() === '') {
        return text;
    }

    try {
        // Try Google Translate first (Better quality)
        const googleUrl = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const googleResponse = await fetchWithTimeout(googleUrl, 10000);
        const googleData = await googleResponse.json();

        // Google returns nested arrays: [[["Translated","Original",...],...],...] 
        if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
            // Combine all parts if multiple sentences
            return googleData[0].map(part => part[0]).join('');
        }
    } catch (googleError) {
        console.warn('Google translation failed, trying fallback:', googleError);
        // If timeout or network error, throw immediately without fallback
        if (googleError.message?.includes('timeout') || googleError.message?.includes('Network request failed')) {
            throw googleError;
        }
    }

    // Fallback to MyMemory
    try {
        const url = `${TRANSLATION_API}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
        const response = await fetchWithTimeout(url, 10000);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }

        console.warn('Translation failed, using original text:', text);
        return text;
    } catch (error) {
        console.error('Translation error:', error);
        // Throw error so caller can handle it appropriately
        throw new Error('Translation failed - please check your internet connection');
    }
}

/**
 * Translate multiple texts in batch
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<Array<string>>} Array of translated texts
 */
export async function translateBatch(texts, targetLang = 'en') {
    if (targetLang === 'en' || !targetLang) {
        return texts;
    }

    try {
        const promises = texts.map(text => translateText(text, targetLang));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Batch translation error:', error);
        return texts; // Return original texts on error
    }
}

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
    { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
    { code: 'fr', label: 'French', nativeLabel: 'Français' },
    { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
    { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '简体中文' },
    { code: 'zh-TW', label: 'Chinese (Traditional)', nativeLabel: '繁體中文' },
    { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
    { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
    { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
    { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
    { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
    { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
    { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
    { code: 'th', label: 'Thai', nativeLabel: 'ไทย' },
    { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
    { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
    { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
    { code: 'fa', label: 'Persian', nativeLabel: 'فارسی' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
    { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
    { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
    { code: 'pl', label: 'Polish', nativeLabel: 'Polski' },
    { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська' },
    { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands' },
    { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά' },
    { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska' },
    { code: 'no', label: 'Norwegian', nativeLabel: 'Norsk' },
    { code: 'da', label: 'Danish', nativeLabel: 'Dansk' },
    { code: 'fi', label: 'Finnish', nativeLabel: 'Suomi' },
    { code: 'cs', label: 'Czech', nativeLabel: 'Čeština' },
    { code: 'ro', label: 'Romanian', nativeLabel: 'Română' },
    { code: 'hu', label: 'Hungarian', nativeLabel: 'Magyar' },
    { code: 'he', label: 'Hebrew', nativeLabel: 'עברית' },
    { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu' },
    { code: 'tl', label: 'Tagalog', nativeLabel: 'Tagalog' },
    { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili' },
    { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans' },
];

/**
 * Specifically translate game word and hint
 * @param {string} word 
 * @param {string} hint 
 * @param {string} targetLang 
 */
export async function translateGameContent(word, hint, targetLang) {
    try {
        const [translatedWord, translatedHint] = await Promise.all([
            translateText(word, targetLang),
            translateText(hint, targetLang)
        ]);
        return { translatedWord, translatedHint };
    } catch (error) {
        console.error('Game content translation error:', error);
        return { translatedWord: word, translatedHint: hint };
    }
}

