// Simple encryption/decryption functions
function encrypt(text) {
    return btoa(text); // Base64 encoding
}

function decrypt(text) {
    return atob(text); // Base64 decoding
}

// Cookie functions with encryption
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    const encryptedValue = encrypt(value);
    document.cookie = name + "=" + encryptedValue + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            const encryptedValue = c.substring(nameEQ.length, c.length);
            try {
                return decrypt(encryptedValue);
            } catch (e) {
                console.error('Error decrypting cookie:', e);
                return null;
            }
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Strict';
}

// API Key functions
function saveApiKey(apiKey) {
    if (apiKey) {
        setCookie('deepl_api_key', apiKey, 365); // Save for 1 year
        return true;
    } else {
        deleteCookie('deepl_api_key');
        return false;
    }
}

function getApiKey() {
    return getCookie('deepl_api_key');
}

// Cookie consent functions
function setCookieConsent() {
    setCookie('cookie_consent', 'true', 365);
}

function hasCookieConsent() {
    return getCookie('cookie_consent') === 'true';
}

// DeepL API functions
async function translateText(text, targetLang) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key found');
    }

    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: [text],
                target_lang: targetLang
            })
        });

        if (!response.ok) {
            throw new Error('Translation failed');
        }

        const data = await response.json();
        return data.translations[0].text;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
} 