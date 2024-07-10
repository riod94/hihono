import { CACHE_KEY } from "../config/constants";
import messages from "./messages";

const localeContext = new Map<string, string>();

const __ = (key: string, replace: { [key: string]: string } = {}, locale?: string): string => {
    const localization: string = locale || getLocale();
    const translation = messages[localization]?.[key] || key;
    if (!translation) {
        return key;
    }

    let translatedText = translation;
    for (const [placeholder, value] of Object.entries(replace)) {
        translatedText = translatedText.replace(`:${placeholder}`, value);
    }

    return translatedText;
}

const setLocale = (language: string): void => {
    localeContext.set(CACHE_KEY.LOCALE, language);
}

const getLocale = (): string => {
    return localeContext.get(CACHE_KEY.LOCALE) || 'en';
}

const unsetLocale = (): void => {
    localeContext.delete(CACHE_KEY.LOCALE);
}

export { __, setLocale, getLocale, unsetLocale };