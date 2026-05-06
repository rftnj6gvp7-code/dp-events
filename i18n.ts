import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'fr';
  const validLocales = ['fr', 'en', 'de', 'lu'];
  const finalLocale = validLocales.includes(locale) ? locale : 'fr';
  
  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default
  };
});
