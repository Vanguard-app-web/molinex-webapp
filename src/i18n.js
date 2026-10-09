import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

/** Supported locales: English (United States, default) and Latin American Spanish. */
export const supportedLocales = Object.freeze(["en-US", "es-419"]);
export const defaultLocale = "en-US";

const dateTimeFormat = {
  date: {year: "numeric", month: "short", day: "numeric"},
  dateTime: {year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"},
  time: {hour: "2-digit", minute: "2-digit"},
  day: {weekday: "long", year: "numeric", month: "long", day: "numeric"},
  today: {year: "numeric", month: "long", day: "2-digit"}
};

const numberFormat = {
  decimal: {style: "decimal", maximumFractionDigits: 2},
  integer: {style: "decimal", maximumFractionDigits: 0}
};

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {"en-US": en, "es-419": es},
  datetimeFormats: {"en-US": dateTimeFormat, "es-419": dateTimeFormat},
  numberFormats: {"en-US": numberFormat, "es-419": numberFormat}
});

export default i18n;
