import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(({ app }) => {
  // Get saved language from localStorage or use browser language
  const savedLanguage = localStorage.getItem('language');
  const browserLanguage = navigator.language || 'en-US';

  // Determine the best language to use
  let locale = 'en-US';
  if (savedLanguage && messages[savedLanguage as MessageLanguages]) {
    locale = savedLanguage;
  } else if (messages[browserLanguage as MessageLanguages]) {
    locale = browserLanguage;
  } else {
    // Try to match language code without region (e.g., 'zh' for 'zh-CN')
    const languageCode = browserLanguage.split('-')[0];
    const matchingLocale = Object.keys(messages).find(key => key.startsWith(languageCode || ''));
    if (matchingLocale) {
      locale = matchingLocale as MessageLanguages;
    }
  }

  const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
    locale,
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
});
