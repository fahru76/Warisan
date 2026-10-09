import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrandMark, Button, ConsentCheckbox, Surface } from '@warisan/ui';
import '@warisan/ui/src/styles.css';

function App() {
  return <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}><BrandMark domain="org" /><nav aria-label="Primary navigation"><a href="/privacy-policy">Privacy</a></nav></header>
    <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'end' }}>
      <div><p style={{ color: '#0f3d36', letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '.75rem' }}>Malaysian heritage, held with care</p><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1, margin: '1rem 0' }}>Warisan.org</h1><p>The trust layer for Malaysian heritage crafts, provenance, and verified Adiguru Kraf.</p><Button>Explore Warisan</Button></div>
      <Surface><h2>Built on provenance</h2><p>Every verified craft carries a traceable identity. Cultural terms stay intact across English and Bahasa Melayu.</p><ConsentCheckbox /></Surface>
    </section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
