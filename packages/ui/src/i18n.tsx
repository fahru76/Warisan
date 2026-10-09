import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type Locale = 'en' | 'ms';
export const localeKey = 'warisan-locale';
export function stored(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
export function persist(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Preferences remain in memory when storage is unavailable. */ } }
const Context = createContext<{locale: Locale; setLocale: (value: Locale) => void} | null>(null);
export function LocaleProvider({children}: {children: ReactNode}) {
  const [locale, update] = useState<Locale>(() => stored(localeKey) === 'ms' ? 'ms' : 'en');
  useEffect(() => {
    document.documentElement.lang = locale;
    persist(localeKey, locale);
    let meta = document.querySelector<HTMLMetaElement>('meta[property="og:locale"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('property', 'og:locale'); document.head.append(meta); }
    meta.content = locale === 'ms' ? 'ms_MY' : 'en_MY';
  }, [locale]);
  return <Context.Provider value={{locale, setLocale: update}}>{children}</Context.Provider>;
}
export function useLocale() {
  const context = useContext(Context);
  if (!context) throw new Error('LocaleProvider is required');
  return {...context, text: (en: string, ms: string) => context.locale === 'ms' ? ms : en};
}
