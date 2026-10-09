import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
export { LanguageSwitcher, PrivacyBanner, ConsentCheckbox, MarketingCheckbox } from './PrivacyControls';
export { LocaleProvider } from './i18n';
export { LegalPage, LegalLinks } from './LegalPage';
export { useLocale } from './i18n';
export type { Locale } from './i18n';
export function BrandMark({ domain }: { domain: 'org' | 'net' }) { return <a href="/" aria-label={`Warisan.${domain} home`} className="brand-mark"><span aria-hidden="true">◇</span><span>WARISAN</span><small>.{domain}</small></a>; }
export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) { return <button {...props} className={`button ${props.className ?? ''}`}>{children}</button>; }
export function Surface({ children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) { return <section {...props} className={`surface ${props.className ?? ''}`}>{children}</section>; }
