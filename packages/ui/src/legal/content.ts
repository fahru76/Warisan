import type { Lang } from "../lib/format";
import type { LegalDoc } from "./paths";

export interface LegalSection {
  heading: string;
  body: string;
}

/** Standard placeholder boilerplate. NOT legal advice — must be reviewed by Malaysian-qualified counsel before launch. */
export const LEGAL_LAST_UPDATED = "2026-10-07";

export const legalContent: Record<Lang, Record<LegalDoc, LegalSection[]>> = {
  en: {
    privacy: [
      { heading: "1. Who we are", body: "Warisan operates Warisan.org (heritage registry) and Warisan.net (marketplace). Both services share one data controller and one database, and this notice applies to both." },
      { heading: "2. Personal data we collect", body: "Name, email address, account role, booking and order details, and, for artisans, craft specialty, location, and profile content. We record the date you gave PDPA consent and whether you opted in to marketing." },
      { heading: "3. Purposes", body: "To operate your account, verify artisans, record provenance, process workshop bookings and orders, provide customer support, and, only if you opted in, send marketing communications." },
      { heading: "4. Disclosure", body: "We share data with payment processors (for FPX payments), hosting and database providers, and the artisan whose workshop you book or whose piece you buy, only as needed to fulfil it." },
      { heading: "5. Your rights under the PDPA 2010", body: "You may request access to and correction of your personal data, withdraw consent, and opt out of marketing at any time by contacting us. We may charge a prescribed fee for data access requests where the law allows." },
      { heading: "6. Retention and security", body: "We keep personal data only as long as needed for the purposes above or as required by law, and protect it with access controls and encryption in transit." },
      { heading: "7. Cookies", body: "Essential cookies keep you signed in and remember your language. Analytics cookies are used only with your consent via the cookie banner." },
      { heading: "8. Contact", body: "Data protection enquiries: privacy@warisan.org (placeholder address)." }
    ],
    terms: [
      { heading: "1. Acceptance", body: "By using Warisan.org or Warisan.net you agree to these terms. If you do not agree, do not use the services." },
      { heading: "2. Accounts", body: "You are responsible for your account credentials and for activity under your account. Information you provide must be accurate." },
      { heading: "3. Registry content", body: "Provenance records reflect information verified by Warisan curators at the time of registration. They are not a valuation or insurance appraisal." },
      { heading: "4. Purchases and bookings", body: "Prices are in Malaysian Ringgit (MYR). Items marked local pickup only must be collected from the artisan. Workshop times are in Malaysia time (UTC+8)." },
      { heading: "5. Cultural respect", body: "Users must not misrepresent, counterfeit, or misattribute heritage crafts or the work of Adiguru Kraf." },
      { heading: "6. Liability", body: "To the extent permitted by Malaysian law, Warisan is not liable for indirect or consequential loss arising from use of the services." },
      { heading: "7. Governing law", body: "These terms are governed by the laws of Malaysia." }
    ],
    vendor: [
      { heading: "1. Parties", body: "This agreement is between Warisan and the artisan (\"Vendor\") listing pieces or workshops on Warisan.net." },
      { heading: "2. Verification", body: "Vendors must be verified on the Warisan.org registry. Warisan may suspend listings pending re-verification." },
      { heading: "3. Listings and provenance", body: "Vendors warrant that each listed piece is their own authentic work. Each piece receives a provenance ID that must not be transferred to another item." },
      { heading: "4. Fulfilment", body: "Vendors must ship or hand over items within the stated period. Fragile or heavy items may be marked local pickup only." },
      { heading: "5. Fees and payouts", body: "Commission rates and payout schedules will be set out in a separate fee schedule (placeholder)." },
      { heading: "6. Personal data", body: "Vendors receive customer data only to fulfil orders and bookings and must handle it in accordance with the PDPA 2010." },
      { heading: "7. Termination", body: "Either party may terminate with 30 days' written notice; outstanding orders must still be fulfilled." }
    ]
  },
  ms: {
    privacy: [
      { heading: "1. Siapa kami", body: "Warisan mengendalikan Warisan.org (daftar warisan) dan Warisan.net (pasaran). Kedua-dua perkhidmatan berkongsi satu pengawal data dan satu pangkalan data, dan notis ini terpakai kepada kedua-duanya." },
      { heading: "2. Data peribadi yang dikumpul", body: "Nama, alamat e-mel, peranan akaun, butiran tempahan dan pesanan, dan bagi artisan, kepakaran kraf, lokasi, dan kandungan profil. Kami merekodkan tarikh anda memberi persetujuan PDPA dan sama ada anda bersetuju menerima pemasaran." },
      { heading: "3. Tujuan", body: "Untuk mengendalikan akaun anda, mengesahkan artisan, merekod asal usul, memproses tempahan bengkel dan pesanan, menyediakan sokongan pelanggan, dan hanya jika anda bersetuju, menghantar komunikasi pemasaran." },
      { heading: "4. Pendedahan", body: "Kami berkongsi data dengan pemproses pembayaran (untuk FPX), penyedia pengehosan dan pangkalan data, dan artisan yang bengkel atau karyanya anda tempah atau beli, setakat yang perlu sahaja." },
      { heading: "5. Hak anda di bawah PDPA 2010", body: "Anda boleh meminta akses dan pembetulan data peribadi anda, menarik balik persetujuan, dan berhenti menerima pemasaran pada bila-bila masa dengan menghubungi kami. Fi yang ditetapkan mungkin dikenakan bagi permintaan akses data jika dibenarkan undang-undang." },
      { heading: "6. Penyimpanan dan keselamatan", body: "Kami menyimpan data peribadi hanya selama yang diperlukan bagi tujuan di atas atau seperti dikehendaki undang-undang, dan melindunginya dengan kawalan akses dan penyulitan semasa penghantaran." },
      { heading: "7. Kuki", body: "Kuki penting mengekalkan log masuk anda dan mengingati bahasa anda. Kuki analitik hanya digunakan dengan persetujuan anda melalui sepanduk kuki." },
      { heading: "8. Hubungi", body: "Pertanyaan perlindungan data: privacy@warisan.org (alamat pemegang tempat)." }
    ],
    terms: [
      { heading: "1. Penerimaan", body: "Dengan menggunakan Warisan.org atau Warisan.net anda bersetuju dengan terma ini. Jika tidak bersetuju, jangan gunakan perkhidmatan ini." },
      { heading: "2. Akaun", body: "Anda bertanggungjawab ke atas kelayakan akaun dan aktiviti di bawah akaun anda. Maklumat yang diberikan mestilah tepat." },
      { heading: "3. Kandungan daftar", body: "Rekod asal usul mencerminkan maklumat yang disahkan oleh kurator Warisan pada masa pendaftaran. Ia bukan penilaian harga atau penilaian insurans." },
      { heading: "4. Pembelian dan tempahan", body: "Harga dalam Ringgit Malaysia (MYR). Item bertanda ambil sendiri sahaja mesti diambil daripada artisan. Masa bengkel dalam waktu Malaysia (UTC+8)." },
      { heading: "5. Menghormati budaya", body: "Pengguna tidak boleh menyalah nyata, meniru, atau menyalah atribusi kraf warisan atau hasil kerja Adiguru Kraf." },
      { heading: "6. Liabiliti", body: "Setakat yang dibenarkan undang-undang Malaysia, Warisan tidak bertanggungan atas kerugian tidak langsung atau berbangkit daripada penggunaan perkhidmatan." },
      { heading: "7. Undang-undang yang mentadbir", body: "Terma ini ditadbir oleh undang-undang Malaysia." }
    ],
    vendor: [
      { heading: "1. Pihak-pihak", body: "Perjanjian ini antara Warisan dan artisan (\"Vendor\") yang menyenaraikan karya atau bengkel di Warisan.net." },
      { heading: "2. Pengesahan", body: "Vendor mesti disahkan dalam daftar Warisan.org. Warisan boleh menggantung penyenaraian sementara menunggu pengesahan semula." },
      { heading: "3. Penyenaraian dan asal usul", body: "Vendor menjamin setiap karya yang disenaraikan adalah hasil kerja tulen mereka sendiri. Setiap karya menerima ID asal usul yang tidak boleh dipindahkan kepada item lain." },
      { heading: "4. Penghantaran", body: "Vendor mesti menghantar atau menyerahkan item dalam tempoh yang dinyatakan. Item rapuh atau berat boleh ditanda ambil sendiri sahaja." },
      { heading: "5. Fi dan pembayaran", body: "Kadar komisen dan jadual pembayaran akan dinyatakan dalam jadual fi berasingan (pemegang tempat)." },
      { heading: "6. Data peribadi", body: "Vendor menerima data pelanggan hanya untuk memenuhi pesanan dan tempahan dan mesti mengendalikannya mengikut PDPA 2010." },
      { heading: "7. Penamatan", body: "Mana-mana pihak boleh menamatkan dengan notis bertulis 30 hari; pesanan tertunggak mesti tetap dipenuhi." }
    ]
  }
};
