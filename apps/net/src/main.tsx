import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrandMark, ConsentCheckbox, LanguageSwitcher, LocaleProvider, MarketingCheckbox, PrivacyBanner, Surface, useLocale } from '@warisan/ui';
import '@warisan/ui/styles.css';
function App(){return <LocaleProvider><Content/></LocaleProvider>}
function Content(){const {text}=useLocale();return <main className="app-shell"><header className="site-header"><BrandMark domain="net"/><nav aria-label={text('Primary navigation','Navigasi utama')}><LanguageSwitcher/><a href="/privacy-policy">{text('Privacy','Privasi')}</a></nav></header><section className="hero"><div><p className="eyebrow">{text('The commerce layer','Lapisan perdagangan')}</p><h1>{text('Buy the story, not just the object.','Beli kisah, bukan sekadar objek.')}</h1><p>{text('Verified crafts and workshops, connected directly to the people who keep them alive.','Kraf dan bengkel disahkan, terus terhubung dengan insan yang mengekalkannya.')}</p></div><Surface><h2>{text('Before booking','Sebelum menempah')}</h2><form onSubmit={event=>event.preventDefault()}><ConsentCheckbox/><MarketingCheckbox/><button className="button" type="submit">{text('Continue','Teruskan')}</button></form></Surface></section><PrivacyBanner/></main>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
