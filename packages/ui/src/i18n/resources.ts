/**
 * Cultural / heritage terms that must never be translated. Eval 5 enforces that each term
 * appears in a BM string exactly when it appears in the EN string for the same key.
 */
export const PROTECTED_TERMS = ["Adiguru Kraf", "Songket", "Canting", "Ukiran", "Labu Sayong", "Pucuk Rebung"] as const;

const en = {
  nav: {
    home: "Home",
    registry: "Registry",
    artisans: "Adiguru Kraf",
    verify: "Verify provenance",
    register: "Register",
    admin: "Admin",
    marketplace: "Marketplace",
    workshops: "Workshops",
    account: "Account",
    menu: "Menu"
  },
  language: { label: "Language", en: "English", ms: "Bahasa Melayu" },
  common: {
    loading: "Loading…",
    error: "Something went wrong. Please try again.",
    retry: "Retry",
    notFound: "We could not find that page.",
    backHome: "Back to home",
    viewAll: "View all",
    demoData: "Showing demo data. Connect Supabase to see the live registry.",
    email: "Email",
    password: "Password",
    fullName: "Full name",
    signIn: "Sign in",
    signOut: "Sign out",
    submit: "Submit",
    kualaLumpurTime: "All times in Malaysia time (MYT, UTC+8)."
  },
  pdpa: {
    consent: "I consent to Warisan processing my personal data under the Personal Data Protection Act 2010 (PDPA) as described in the Privacy Policy.",
    marketing: "Send me news about Adiguru Kraf, workshops, and new collections (optional).",
    required: "Consent is required to continue."
  },
  cookie: {
    message: "We use essential cookies to keep you signed in and remember your language. With your permission we also use analytics cookies.",
    accept: "Accept all",
    essential: "Essential only",
    learnMore: "Privacy Policy"
  },
  legal: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    vendor: "Vendor Agreement",
    lastUpdated: "Last updated",
    placeholder: "Placeholder text. This document must be reviewed by a Malaysian-qualified lawyer before launch."
  },
  footer: {
    rights: "All rights reserved.",
    trustLayer: "Warisan.org — the registry",
    commerceLayer: "Warisan.net — the marketplace",
    legal: "Legal"
  },
  org: {
    tagline: "The national registry of Malaysian heritage craft",
    hero: {
      eyebrow: "Digital provenance registry",
      title: "Every heritage craft deserves a verifiable story.",
      subtitle: "Warisan.org records the makers, motifs, and lineage behind each piece — from Songket looms in Terengganu to Labu Sayong kilns in Perak — certified by Adiguru Kraf.",
      cta: "Explore the registry",
      ctaSecondary: "Verify a piece"
    },
    bento: {
      registryTitle: "Verified provenance",
      registryBody: "Each piece carries a unique provenance ID that links back here via QR code.",
      archiveTitle: "Cultural archive",
      archiveBody: "Motifs like Pucuk Rebung documented with their meaning and regional origin.",
      directoryTitle: "Adiguru Kraf directory",
      directoryBody: "Meet the masters keeping Songket, Ukiran, Canting, and Labu Sayong alive.",
      statArtisans: "verified makers",
      statItems: "registered pieces"
    },
    directory: {
      title: "Adiguru Kraf directory",
      subtitle: "Verified master artisans and their living craft traditions.",
      empty: "No verified artisans yet."
    },
    artisan: {
      verified: "Verified",
      specialty: "Craft",
      location: "Based in",
      works: "Registered works",
      workshops: "Upcoming workshops",
      bookOnNet: "Book on Warisan.net",
      notFound: "This artisan is not in the registry."
    },
    provenance: {
      title: "Verify provenance",
      subtitle: "Scan the QR tag or enter the provenance ID printed on the certificate.",
      inputLabel: "Provenance ID or registry link",
      lookup: "Verify",
      invalid: "That does not look like a valid provenance ID.",
      notFound: "No registered piece matches this provenance ID. It may be counterfeit or not yet published.",
      authentic: "Registered and authentic",
      maker: "Maker",
      registeredOn: "Registered",
      provenanceId: "Provenance ID",
      shop: "View on Warisan.net"
    },
    register: {
      title: "Apply as an artisan",
      subtitle: "Join the registry. Our curators review every application before verification.",
      specialty: "Craft specialty",
      location: "Town / state",
      submit: "Submit application",
      success: "Application received. Check your email to confirm your account; a curator will review your profile.",
      offline: "Demo mode: Supabase is not connected, so nothing was submitted."
    },
    admin: {
      title: "Registry admin",
      subtitle: "Review and verify artisan applications.",
      pending: "Pending applications",
      empty: "No applications waiting. All clear.",
      verify: "Verify artisan",
      verified: "Verified",
      notAdmin: "This account does not have admin access to Warisan.org.",
      offline: "Demo mode: actions are not saved."
    }
  },
  net: {
    tagline: "Heritage craft, direct from the masters",
    hero: {
      eyebrow: "Verified heritage marketplace",
      title: "Collect heritage. Learn it by hand.",
      subtitle: "Own authentic Songket, Ukiran, and Labu Sayong pieces — each linked to its Warisan.org provenance record — or book a workshop with an Adiguru Kraf.",
      cta: "Shop the collection",
      ctaSecondary: "Book a workshop"
    },
    grid: {
      title: "The collection",
      subtitle: "Every piece is registered with a verifiable provenance ID.",
      empty: "No pieces are available right now."
    },
    product: {
      by: "By",
      pickupOnly: "Local pickup only",
      pickupOnlyHelp: "This piece is fragile or heavy and must be collected from the artisan.",
      ships: "Ships within Malaysia",
      provenance: "Provenance record",
      buy: "Buy now",
      notFound: "This piece is not available."
    },
    workshops: {
      title: "Workshops",
      subtitle: "Small-group sessions taught by Adiguru Kraf in their own studios.",
      seats: "seats",
      perPerson: "per person",
      book: "Book",
      empty: "No workshops scheduled."
    },
    booking: {
      title: "Book this workshop",
      quantity: "Participants",
      submit: "Confirm booking",
      success: "Booking requested. We will email your confirmation.",
      signInRequired: "Please sign in or create an account to book.",
      offline: "Demo mode: Supabase is not connected, so no booking was made."
    },
    checkout: {
      title: "Checkout",
      testMode: "Test mode — no real payment will be taken.",
      fulfilment: "Fulfilment",
      delivery: "Delivery",
      pickup: "Pickup from artisan",
      method: "Payment method",
      fpx: "FPX online banking",
      total: "Total",
      pay: "Pay with FPX",
      success: "Test payment intent created",
      reference: "Reference"
    },
    account: {
      title: "Your account",
      signInTab: "Sign in",
      registerTab: "Create account",
      register: "Create account",
      registered: "Account created. Check your email to confirm.",
      signedInAs: "Signed in as",
      offline: "Demo mode: Supabase is not connected."
    }
  },
  seo: {
    orgTitle: "Warisan.org — Registry of Malaysian heritage craft",
    orgDescription: "Verified provenance, cultural archive, and the Adiguru Kraf directory for Malaysian heritage crafts.",
    netTitle: "Warisan.net — Verified Malaysian heritage craft marketplace",
    netDescription: "Buy authentic Songket, Ukiran, and Labu Sayong pieces and book workshops with Adiguru Kraf."
  }
};

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const ms: Shape<typeof en> = {
  nav: {
    home: "Utama",
    registry: "Daftar",
    artisans: "Adiguru Kraf",
    verify: "Sahkan asal usul",
    register: "Daftar",
    admin: "Pentadbir",
    marketplace: "Pasaran",
    workshops: "Bengkel",
    account: "Akaun",
    menu: "Menu"
  },
  language: { label: "Bahasa", en: "English", ms: "Bahasa Melayu" },
  common: {
    loading: "Memuatkan…",
    error: "Ralat berlaku. Sila cuba lagi.",
    retry: "Cuba lagi",
    notFound: "Halaman tidak ditemui.",
    backHome: "Kembali ke utama",
    viewAll: "Lihat semua",
    demoData: "Memaparkan data demo. Sambungkan Supabase untuk melihat daftar sebenar.",
    email: "E-mel",
    password: "Kata laluan",
    fullName: "Nama penuh",
    signIn: "Log masuk",
    signOut: "Log keluar",
    submit: "Hantar",
    kualaLumpurTime: "Semua masa dalam waktu Malaysia (MYT, UTC+8)."
  },
  pdpa: {
    consent: "Saya bersetuju Warisan memproses data peribadi saya di bawah Akta Perlindungan Data Peribadi 2010 (PDPA) seperti yang diterangkan dalam Dasar Privasi.",
    marketing: "Hantar berita tentang Adiguru Kraf, bengkel, dan koleksi baharu kepada saya (pilihan).",
    required: "Persetujuan diperlukan untuk meneruskan."
  },
  cookie: {
    message: "Kami menggunakan kuki penting untuk mengekalkan log masuk dan mengingati bahasa anda. Dengan kebenaran anda, kami juga menggunakan kuki analitik.",
    accept: "Terima semua",
    essential: "Penting sahaja",
    learnMore: "Dasar Privasi"
  },
  legal: {
    privacy: "Dasar Privasi",
    terms: "Terma Penggunaan",
    vendor: "Perjanjian Vendor",
    lastUpdated: "Kemas kini terakhir",
    placeholder: "Teks pemegang tempat. Dokumen ini mesti disemak oleh peguam bertauliah Malaysia sebelum pelancaran."
  },
  footer: {
    rights: "Hak cipta terpelihara.",
    trustLayer: "Warisan.org — daftar rasmi",
    commerceLayer: "Warisan.net — pasaran",
    legal: "Perundangan"
  },
  org: {
    tagline: "Daftar kebangsaan kraf warisan Malaysia",
    hero: {
      eyebrow: "Daftar asal usul digital",
      title: "Setiap kraf warisan layak mempunyai kisah yang boleh disahkan.",
      subtitle: "Warisan.org merekodkan pembuat, motif, dan salasilah di sebalik setiap karya — dari alat tenun Songket di Terengganu hingga tanur Labu Sayong di Perak — disahkan oleh Adiguru Kraf.",
      cta: "Terokai daftar",
      ctaSecondary: "Sahkan karya"
    },
    bento: {
      registryTitle: "Asal usul disahkan",
      registryBody: "Setiap karya mempunyai ID asal usul unik yang dipautkan ke sini melalui kod QR.",
      archiveTitle: "Arkib budaya",
      archiveBody: "Motif seperti Pucuk Rebung didokumentasikan bersama makna dan asal daerahnya.",
      directoryTitle: "Direktori Adiguru Kraf",
      directoryBody: "Kenali para pakar yang memelihara Songket, Ukiran, Canting, dan Labu Sayong.",
      statArtisans: "pembuat disahkan",
      statItems: "karya berdaftar"
    },
    directory: {
      title: "Direktori Adiguru Kraf",
      subtitle: "Artisan pakar yang disahkan dan tradisi kraf mereka.",
      empty: "Belum ada artisan disahkan."
    },
    artisan: {
      verified: "Disahkan",
      specialty: "Kraf",
      location: "Berpangkalan di",
      works: "Karya berdaftar",
      workshops: "Bengkel akan datang",
      bookOnNet: "Tempah di Warisan.net",
      notFound: "Artisan ini tiada dalam daftar."
    },
    provenance: {
      title: "Sahkan asal usul",
      subtitle: "Imbas tag QR atau masukkan ID asal usul yang tercetak pada sijil.",
      inputLabel: "ID asal usul atau pautan daftar",
      lookup: "Sahkan",
      invalid: "Itu bukan ID asal usul yang sah.",
      notFound: "Tiada karya berdaftar sepadan dengan ID ini. Ia mungkin tiruan atau belum diterbitkan.",
      authentic: "Berdaftar dan tulen",
      maker: "Pembuat",
      registeredOn: "Didaftarkan",
      provenanceId: "ID asal usul",
      shop: "Lihat di Warisan.net"
    },
    register: {
      title: "Mohon sebagai artisan",
      subtitle: "Sertai daftar. Kurator kami menyemak setiap permohonan sebelum pengesahan.",
      specialty: "Kepakaran kraf",
      location: "Bandar / negeri",
      submit: "Hantar permohonan",
      success: "Permohonan diterima. Semak e-mel anda untuk mengesahkan akaun; kurator akan menyemak profil anda.",
      offline: "Mod demo: Supabase tidak disambungkan, jadi tiada apa yang dihantar."
    },
    admin: {
      title: "Pentadbir daftar",
      subtitle: "Semak dan sahkan permohonan artisan.",
      pending: "Permohonan menunggu",
      empty: "Tiada permohonan menunggu.",
      verify: "Sahkan artisan",
      verified: "Disahkan",
      notAdmin: "Akaun ini tiada akses pentadbir Warisan.org.",
      offline: "Mod demo: tindakan tidak disimpan."
    }
  },
  net: {
    tagline: "Kraf warisan, terus daripada pakarnya",
    hero: {
      eyebrow: "Pasaran warisan disahkan",
      title: "Miliki warisan. Pelajarinya dengan tangan.",
      subtitle: "Miliki karya Songket, Ukiran, dan Labu Sayong yang tulen — setiap satu dipautkan ke rekod asal usul Warisan.org — atau tempah bengkel bersama Adiguru Kraf.",
      cta: "Beli koleksi",
      ctaSecondary: "Tempah bengkel"
    },
    grid: {
      title: "Koleksi",
      subtitle: "Setiap karya berdaftar dengan ID asal usul yang boleh disahkan.",
      empty: "Tiada karya tersedia buat masa ini."
    },
    product: {
      by: "Oleh",
      pickupOnly: "Ambil sendiri sahaja",
      pickupOnlyHelp: "Karya ini rapuh atau berat dan mesti diambil daripada artisan.",
      ships: "Penghantaran dalam Malaysia",
      provenance: "Rekod asal usul",
      buy: "Beli sekarang",
      notFound: "Karya ini tidak tersedia."
    },
    workshops: {
      title: "Bengkel",
      subtitle: "Sesi kumpulan kecil yang diajar oleh Adiguru Kraf di studio mereka.",
      seats: "tempat",
      perPerson: "seorang",
      book: "Tempah",
      empty: "Tiada bengkel dijadualkan."
    },
    booking: {
      title: "Tempah bengkel ini",
      quantity: "Peserta",
      submit: "Sahkan tempahan",
      success: "Tempahan diminta. Kami akan menghantar pengesahan melalui e-mel.",
      signInRequired: "Sila log masuk atau cipta akaun untuk menempah.",
      offline: "Mod demo: Supabase tidak disambungkan, jadi tiada tempahan dibuat."
    },
    checkout: {
      title: "Pembayaran",
      testMode: "Mod ujian — tiada bayaran sebenar akan dikenakan.",
      fulfilment: "Penghantaran",
      delivery: "Hantar ke alamat",
      pickup: "Ambil daripada artisan",
      method: "Kaedah pembayaran",
      fpx: "Perbankan dalam talian FPX",
      total: "Jumlah",
      pay: "Bayar dengan FPX",
      success: "Niat pembayaran ujian dicipta",
      reference: "Rujukan"
    },
    account: {
      title: "Akaun anda",
      signInTab: "Log masuk",
      registerTab: "Cipta akaun",
      register: "Cipta akaun",
      registered: "Akaun dicipta. Semak e-mel anda untuk pengesahan.",
      signedInAs: "Log masuk sebagai",
      offline: "Mod demo: Supabase tidak disambungkan."
    }
  },
  seo: {
    orgTitle: "Warisan.org — Daftar kraf warisan Malaysia",
    orgDescription: "Asal usul disahkan, arkib budaya, dan direktori Adiguru Kraf untuk kraf warisan Malaysia.",
    netTitle: "Warisan.net — Pasaran kraf warisan Malaysia yang disahkan",
    netDescription: "Beli karya Songket, Ukiran, dan Labu Sayong yang tulen serta tempah bengkel bersama Adiguru Kraf."
  }
};

export const resources = {
  en: { translation: en },
  ms: { translation: ms }
} as const;

export type TranslationShape = typeof en;
