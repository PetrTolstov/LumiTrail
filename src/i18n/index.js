import { createI18n } from 'vue-i18n';
import en from '../i18n/en.js';
import ru from '../i18n/ru.js';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: { en, ru },
});
