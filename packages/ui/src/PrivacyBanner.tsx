import { useEffect, useState } from 'react';
import type { Locale } from './i18n';
import { translations } from './i18n';

const CONSENT_KEY = 'warisan-consent-v1';
type ConsentState = 'essential' | 'marketing' | 'pending';
export function PrivacyBanner({ locale, onManage }: { locale: Locale; onManage?: () => void }) {
  const t = translations[locale];
  const [consent, setConsent] = useState<ConsentState>('pending');
  useEffect(() => { const saved = window.localStorage.getItem(CONSENT_KEY); if (saved === 'essential' || saved === 'marketing') setConsent(saved); }, []);
  if (consent !== 'pending') return null;
  const save = (next: Exclude<ConsentState, 'pending'>) => { window.localStorage.setItem(CONSENT_KEY, next); setConsent(next); };
  return <aside className="privacy-banner" aria-labelledby="privacy-title"><div><h2 id="privacy-title">{t.consentTitle}</h2><p>{t.consentDescription}</p></div><div className="privacy-actions"><button className="button button-secondary" onClick={() => save('essential')}>{t.accept}</button><button className="button" onClick={() => save('marketing')}>{t.marketing}</button>{onManage && <button className="text-button" onClick={onManage}>{t.manage}</button>}</div></aside>;
}
export function LanguageSwitcher({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) { const t = translations[locale]; return <label className="language-switcher"><span>{t.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language}><option value="en">{t.english}</option><option value="ms">{t.bahasaMelayu}</option></select></label>; }
