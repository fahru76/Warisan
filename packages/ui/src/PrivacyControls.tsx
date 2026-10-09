import { useId, useRef, useState, type InputHTMLAttributes } from 'react';
import { persist, stored, useLocale } from './i18n';
export const consentKey = 'warisan-privacy-v2';
type Preference = {version: 2; essential: true; analytics: boolean; savedAt: string};
function read(): Preference | null {
  try { const value = JSON.parse(stored(consentKey) ?? 'null'); return value?.version === 2 && value.essential === true && typeof value.analytics === 'boolean' && typeof value.savedAt === 'string' && Number.isFinite(Date.parse(value.savedAt)) ? value : null; } catch { return null; }
}
export function LanguageSwitcher() {
  const {locale, setLocale, text} = useLocale();
  return <label className="language-switcher"><span>{text('Language', 'Bahasa')}</span><select value={locale} onChange={event => setLocale(event.target.value === 'ms' ? 'ms' : 'en')}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select></label>;
}
export function PrivacyBanner() {
  const {text} = useLocale();
  const [saved, setSaved] = useState(read);
  const [open, setOpen] = useState(() => !read());
  const [analytics, setAnalytics] = useState(() => read()?.analytics ?? false);
  const manage = useRef<HTMLButtonElement>(null);
  const heading = useId();
  function save(allowed: boolean) {
    const next: Preference = {version: 2, essential: true, analytics: allowed, savedAt: new Date().toISOString()};
    persist(consentKey, JSON.stringify(next)); setSaved(next); setAnalytics(allowed); setOpen(false);
    window.dispatchEvent(new CustomEvent('warisan:privacy', {detail: next}));
    requestAnimationFrame(() => manage.current?.focus());
  }
  return <><button ref={manage} type="button" className="text-button" aria-expanded={open} onClick={() => {setAnalytics(saved?.analytics ?? false); setOpen(true);}}>{text('Privacy settings', 'Tetapan privasi')}</button>
    {open && <aside className="privacy-banner" aria-labelledby={heading}><div><h2 id={heading}>{text('Your privacy choices', 'Pilihan privasi anda')}</h2><p>{text('Essential storage remembers your language and privacy settings. Optional analytics stays off unless you choose it. This is not registration consent or marketing permission.', 'Storan penting mengingati bahasa dan tetapan privasi anda. Analitik pilihan dimatikan melainkan anda memilihnya. Ini bukan persetujuan pendaftaran atau kebenaran pemasaran.')}</p><a href="/privacy-policy">{text('Read the privacy notice', 'Baca notis privasi')}</a><label className="consent"><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} />{text('Allow optional analytics', 'Benarkan analitik pilihan')}</label></div>
    <div className="privacy-actions"><button className="button button-secondary" type="button" onClick={() => save(false)}>{text('Essential only', 'Penting sahaja')}</button><button className="button button-secondary" type="button" onClick={() => save(analytics)}>{text('Save choices', 'Simpan pilihan')}</button></div></aside>}</>;
}
export function ConsentCheckbox({id, ...props}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'defaultChecked' | 'checked'>) {
  const {text} = useLocale(); const generated = useId();
  return <label className="consent" htmlFor={id ?? generated}><input {...props} id={id ?? generated} name={props.name ?? 'pdpa_consent'} type="checkbox" required={props.required ?? true} defaultChecked={false} /><span>{text('I agree to processing described in the privacy notice.', 'Saya bersetuju dengan pemprosesan yang diterangkan dalam notis privasi.')} <a href="/privacy-policy">{text('Privacy notice', 'Notis privasi')}</a></span></label>;
}
export function MarketingCheckbox() {
  const {text} = useLocale();
  return <label className="consent"><input type="checkbox" name="marketing_opt_in" defaultChecked={false} />{text('Email me optional marketing updates.', 'Hantar kemas kini pemasaran pilihan melalui e-mel.')}</label>;
}
