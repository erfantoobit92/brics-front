import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fa from './locales/fa.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ru from './locales/ru.json';
import hi from './locales/hi.json';

const resources = {
  en: { ...en },
  fa: { ...fa },
  ar: { ...ar },
  zh: { ...zh },
  ru: { ...ru },
  hi: { ...hi },
};

i18n
  .use(LanguageDetector) // تشخیص زبان کاربر
  .use(initReactI18next) // اتصال به react-i18next
  .init({
    resources,
    fallbackLng: 'en', // زبان پیش‌فرض در صورت نبودن ترجمه
    interpolation: {
      escapeValue: false, // برای جلوگیری از XSS در React لازم نیست
    },
    detection: {
      order: ['localStorage', 'navigator'], // اولویت تشخیص: ۱. لوکال استوریج ۲. زبان مرورگر
      caches: ['localStorage'], // کجا زبان انتخاب شده ذخیره بشه
    },
  });

export default i18n;