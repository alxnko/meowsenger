import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr_en from "../../translations/en.json";
import tr_ru from "../../translations/ru.json";

const resources = {
  en: {
    translation: tr_en,
  },
  ru: {
    translation: tr_ru,
  },
};

const lang = localStorage.getItem("lang");

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "en",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    lang,
  });

export default i18n;
