import { useEffect, useState } from 'react';

export type Locale = 'en' | 'ms';
const STORAGE_KEY = 'warisan-locale';

export const translations = {
  en: {
    language: 'Language', english: 'English', bahasaMelayu: 'Bahasa Melayu',
    privacy: 'Privacy', artisans: 'Adiguru Kraf', registry: 'Registry',
    verifiedArtisans: 'Verified Adiguru Kraf', records: 'records',
    provenanceRegistry: 'Provenance registry', viewRecord: 'View registry record', viewArtisan: 'View artisan record',
    verifiedArtisan: 'Verified artisan', basedIn: 'Based in', localPickup: 'Local pickup only', delivery: 'Eligible for delivery',
    privacyPolicy: 'Privacy Policy', terms: 'Terms of Use', vendorAgreement: 'Vendor Agreement',
    consent: 'I agree to the Warisan privacy notice and PDPA processing terms.', consentTitle: 'Privacy choices',
    consentDescription: 'We use essential storage to remember your language and consent choice. Optional marketing messages require separate consent.',
    accept: 'Accept essential', marketing: 'Allow marketing', manage: 'Manage privacy choices', close: 'Close',
    loading: 'Loading the registry…', unavailable: 'Registry unavailable', retry: 'Try again',
  },
  ms: {
    language: 'Bahasa', english: 'English', bahasaMelayu: 'Bahasa Melayu',
    privacy: 'Privasi', artisans: 'Adiguru Kraf', registry: 'Daftar Warisan',
    verifiedArtisans: 'Adiguru Kraf Disahkan', records: 'rekod',
    provenanceRegistry: 'Daftar asal-usul', viewRecord: 'Lihat rekod daftar', viewArtisan: 'Lihat rekod artisan',
    verifiedArtisan: 'Artisan disahkan', basedIn: 'Berpangkalan di', localPickup: 'Ambil sendiri sahaja', delivery: 'Layak untuk penghantaran',
    privacyPolicy: 'Dasar Privasi', terms: 'Syarat Penggunaan', vendorAgreement: 'Perjanjian Vendor',
    consent: 'Saya bersetuju dengan notis privasi Warisan dan terma pemprosesan PDPA.', consentTitle: 'Pilihan privasi',
    consentDescription: 'Kami menggunakan storan penting untuk mengingati bahasa dan pilihan persetujuan anda. Mesej pemasaran pilihan memerlukan persetujuan berasingan.',
    accept: 'Terima penting', marketing: 'Benarkan pemasaran', manage: 'Urus pilihan privasi', close: 'Tutup',
    loading: 'Memuatkan daftar…', unavailable: 'Daftar tidak tersedia', retry: 'Cuba lagi',
  },
} as const;
export type TranslationKey = keyof typeof translations.en;
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => { const saved = window.localStorage.getItem(STORAGE_KEY); return saved === 'ms' ? 'ms' : 'en'; });
  useEffect(() => { document.documentElement.lang = locale === 'ms' ? 'ms' : 'en'; localStorage.setItem(STORAGE_KEY, locale); }, [locale]);
  return { locale, setLocale: (next: Locale) => setLocaleState(next), t: (key: TranslationKey) => translations[locale][key] };
}
