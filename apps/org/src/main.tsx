import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrandMark, Surface } from '@warisan/ui';
import type { Artisan, CraftItem } from '@warisan/supabase-types';
import { DataError, getPublishedCrafts, getVerifiedArtisans } from './data';
import '@warisan/ui/styles.css';

type LoadState = 'loading' | 'ready' | 'error';

function App() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [crafts, setCrafts] = useState<CraftItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  async function loadRegistry() {
    setState('loading'); setError('');
    try {
      const [nextArtisans, nextCrafts] = await Promise.all([getVerifiedArtisans(), getPublishedCrafts()]);
      setArtisans(nextArtisans); setCrafts(nextCrafts); setState('ready');
    } catch (cause) { setState('error'); setError(cause instanceof DataError ? cause.message : 'The registry is temporarily unavailable.'); }
  }
  useEffect(() => { void loadRegistry(); }, []);

  return <main style={{ maxWidth: '78rem', margin: '0 auto', padding: '1.5rem' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '5rem' }}><BrandMark domain="org" /><nav aria-label="Primary navigation" style={{ display: 'flex', gap: '1rem' }}><a href="#artisans">Adiguru Kraf</a><a href="#registry">Registry</a><a href="/privacy-policy">Privacy</a></nav></header>
    <section style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(18rem, .7fr)', alignItems: 'end', marginBottom: '4rem' }}>
      <div><p style={{ color: 'var(--warisan-emerald)', letterSpacing: '.14em', textTransform: 'uppercase', fontSize: '.75rem' }}>The trust layer</p><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: .95, margin: '1rem 0' }}>Craft carries memory.</h1><p style={{ maxWidth: '38rem', fontSize: '1.15rem', lineHeight: 1.65 }}>Warisan.org records the people, practices, and provenance behind Malaysian heritage craft.</p></div>
      <Surface><p style={{ color: 'var(--warisan-gold)', fontWeight: 700 }}>Registry principle</p><h2 style={{ fontFamily: 'Georgia, serif' }}>Verified, traceable, human.</h2><p>Explore published records for Songket, Canting, Ukiran, Labu Sayong, and more.</p></Surface>
    </section>
    {state === 'loading' && <div role="status" aria-live="polite" className="surface">Loading the registry…</div>}
    {state === 'error' && <div role="alert" className="surface"><h2>Registry unavailable</h2><p>{error}</p><button className="button" onClick={() => void loadRegistry()}>Try again</button></div>}
    {state === 'ready' && <>
      <section id="artisans" aria-labelledby="artisan-heading" style={{ marginBottom: '4rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}><h2 id="artisan-heading" style={{ fontFamily: 'Georgia, serif', fontSize: '2.25rem' }}>Verified Adiguru Kraf</h2><span>{artisans.length} records</span></div><div className="registry-grid">{artisans.map((artisan) => <Surface key={artisan.id}><p style={{ color: 'var(--warisan-emerald)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>{artisan.craft_specialty}</p><h3>{artisan.name}</h3><p>{artisan.bio}</p><p><strong>Based in:</strong> {artisan.location}</p><span className="verified">✓ Verified artisan</span></Surface>)}</div>{artisans.length === 0 && <p role="status">No verified artisans are currently published.</p>}</section>
      <section id="registry" aria-labelledby="registry-heading"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}><h2 id="registry-heading" style={{ fontFamily: 'Georgia, serif', fontSize: '2.25rem' }}>Provenance registry</h2><span>{crafts.length} records</span></div><div className="registry-grid">{crafts.map((craft) => <Surface key={craft.id}><p style={{ color: 'var(--warisan-gold)', fontFamily: 'monospace', fontSize: '.75rem' }}>PROVENANCE {craft.provenance_id.slice(0, 8).toUpperCase()}</p><h3>{craft.name}</h3><p>{craft.description}</p><p><strong>MYR {Number(craft.price_myr).toFixed(2)}</strong>{craft.is_local_pickup_only && ' · Local pickup only'}</p><a href={`#provenance-${craft.provenance_id}`}>View registry record</a></Surface>)}</div>{crafts.length === 0 && <p role="status">No published craft records are currently available.</p>}</section>
    </>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
