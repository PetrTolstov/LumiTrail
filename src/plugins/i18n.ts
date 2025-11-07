import { i18n } from '~/i18n';

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.provide('$locale', computed(() => i18n.global.locale.value));
  vueApp.use(i18n);
});

