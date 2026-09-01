import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Verified image URLs (all checked HTTP 200 at seed authoring time).
// Wikimedia entries are real product photos of the named perfume.
// Unsplash entries are stock perfume-bottle photography (generic).
const IMG = {
  // Wikimedia — real bottle photos
  chanelNo5: "https://upload.wikimedia.org/wikipedia/commons/8/85/CHANEL_No5_parfum.jpg",
  chanelNo5Alt: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Chanel_No._5_Fragrance_Austin_Calhoon_Photograph.jpg",
  shalimar: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Perfume_Shalimar.jpg",
  adpColonia: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Acqua_di_Parma_Colonia.jpg",
  adpAlt: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Acqua_di_Parma.jpg",
  // Unsplash — generic perfume photography
  u1: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
  u2: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
  u3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
  u4: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80",
  u5: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
  u6: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
  u7: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
  u8: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
  u9: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  u10: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=800&q=80",
  u11: "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800&q=80",
  u12: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=80",
  u13: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
  u14: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
  u15: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80",
  u16: "https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=800&q=80",
  u17: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80",
  u18: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
  u19: "https://images.unsplash.com/photo-1546552768-9e3a94b38a59?w=800&q=80",
} as const;

type SeedVariant = { size: string; price: number; stock: number; sku: string };
type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  images: string[];
  isFeatured?: boolean;
  variants: SeedVariant[];
};

const categories: { name: string; slug: string; image: string }[] = [
  { name: "Oud", slug: "oud", image: IMG.u5 },
  { name: "Floral", slug: "floral", image: IMG.chanelNo5 },
  { name: "Woody", slug: "woody", image: IMG.u3 },
  { name: "Citrus & Fresh", slug: "citrus-fresh", image: IMG.adpColonia },
  { name: "Oriental & Amber", slug: "oriental-amber", image: IMG.shalimar },
  { name: "Gourmand", slug: "gourmand", image: IMG.u11 },
  { name: "Musk", slug: "musk", image: IMG.u9 },
];

const products: SeedProduct[] = [
  // ── Vendor Specific Test Products ─────────────────────
  {
    name: "Lattafa Khamrah",
    slug: "lattafa-khamrah",
    description: "A luxurious unisex gourmand fragrance featuring cinnamon, nutmeg, praline, dates and vanilla.",
    categorySlug: "gourmand",
    images: [IMG.u11, IMG.u6],
    isFeatured: true,
    variants: [
      { size: "100ml", price: 35000, stock: 25, sku: "LAT-KHAM-100" },
    ],
  },
  {
    name: "Lattafa Yara",
    slug: "lattafa-yara",
    description: "A creamy tropical blend of orchid, heliotrope, gourmand notes and soft musk.",
    categorySlug: "gourmand",
    images: [IMG.u6, IMG.u17],
    isFeatured: true,
    variants: [
      { size: "100ml", price: 32000, stock: 20, sku: "LAT-YARA-100" },
    ],
  },
  {
    name: "Afnan 9PM",
    slug: "afnan-9pm",
    description: "A captivating evening fragrance with bergamot, lavender, cinnamon, apple and amberwood.",
    categorySlug: "oriental-amber",
    images: [IMG.u8, IMG.u15],
    isFeatured: true,
    variants: [
      { size: "100ml", price: 34000, stock: 30, sku: "AFN-9PM-100" },
    ],
  },
  {
    name: "Armaf Club de Nuit Intense Man",
    slug: "armaf-club-de-nuit",
    description: "A bold citrus-woody fragrance with lemon, blackcurrant, apple, birch, rose and musk.",
    categorySlug: "woody",
    images: [IMG.u3, IMG.u18],
    isFeatured: true,
    variants: [
      { size: "105ml", price: 38000, stock: 22, sku: "ARM-CDNIM-105" },
    ],
  },
  {
    name: "Lattafa Asad",
    slug: "lattafa-asad",
    description: "A dark spicy fragrance with black pepper, pineapple, tobacco, coffee, patchouli and vanilla.",
    categorySlug: "oriental-amber",
    images: [IMG.u15, IMG.u8],
    isFeatured: true,
    variants: [
      { size: "100ml", price: 33000, stock: 18, sku: "LAT-ASAD-100" },
    ],
  },
  {
    name: "Fakhar Black",
    slug: "fakhar-black",
    description: "An oriental aromatic blend of apple, ginger, bergamot, lavender, sage and tonka bean.",
    categorySlug: "citrus-fresh",
    images: [IMG.u19, IMG.u11],
    variants: [
      { size: "100ml", price: 31000, stock: 15, sku: "LAT-FAKHAR-100" },
    ],
  },
  {
    name: "Oud for Glory",
    slug: "oud-for-glory",
    description: "Lattafa Bade'e Al Oud - an intense woody fragrance with lavender, saffron, nutmeg and natural oud wood.",
    categorySlug: "oud",
    images: [IMG.u5, IMG.u14],
    isFeatured: true,
    variants: [
      { size: "100ml", price: 39000, stock: 16, sku: "LAT-OFG-100" },
    ],
  },

  // ── Oud ──────────────────────────────────────────────
  {
    name: "Tom Ford Oud Wood",
    slug: "tom-ford-oud-wood",
    description:
      "A smooth, smoky oud composition layered with rosewood, cardamom, sandalwood and a whisper of vanilla.",
    categorySlug: "oud",
    images: [IMG.u5, IMG.u4],
    isFeatured: true,
    variants: [
      { size: "50ml", price: 55000, stock: 18, sku: "TF-OUDWOOD-50" },
      { size: "100ml", price: 92000, stock: 10, sku: "TF-OUDWOOD-100" },
    ],
  },
  {
    name: "Maison Francis Kurkdjian Oud Satin Mood",
    slug: "mfk-oud-satin-mood",
    description:
      "Velvet rose petals folded into oud, violet and Damascus rose absolute — voluptuous and resinous.",
    categorySlug: "oud",
    images: [IMG.u4, IMG.u14],
    variants: [
      { size: "35ml", price: 38000, stock: 12, sku: "MFK-OUDSATIN-35" },
      { size: "70ml", price: 68000, stock: 9, sku: "MFK-OUDSATIN-70" },
      { size: "200ml", price: 165000, stock: 4, sku: "MFK-OUDSATIN-200" },
    ],
  },
  {
    name: "Creed Royal Oud",
    slug: "creed-royal-oud",
    description:
      "A regal blend of Sicilian lemon, pink peppercorn, Indian oud, Tuscan cedar and Sahara cypress.",
    categorySlug: "oud",
    images: [IMG.u14, IMG.u5],
    isFeatured: true,
    variants: [
      { size: "50ml", price: 78000, stock: 8, sku: "CR-ROYALOUD-50" },
      { size: "100ml", price: 125000, stock: 5, sku: "CR-ROYALOUD-100" },
    ],
  },
  {
    name: "By Kilian Pure Oud",
    slug: "kilian-pure-oud",
    description:
      "An uncompromising tribute to raw oud: smoky, leathery and faintly animalic over saffron and gaiac wood.",
    categorySlug: "oud",
    images: [IMG.u15, IMG.u4],
    variants: [
      { size: "50ml", price: 72000, stock: 6, sku: "BK-PUREOUD-50" },
      { size: "100ml", price: 118000, stock: 0, sku: "BK-PUREOUD-100" },
    ],
  },

  // ── Floral ───────────────────────────────────────────
  {
    name: "Chanel No. 5",
    slug: "chanel-no-5",
    description:
      "The original abstract floral aldehyde: ylang-ylang, May rose, jasmine and the iconic Chanel sillage.",
    categorySlug: "floral",
    images: [IMG.chanelNo5, IMG.chanelNo5Alt],
    isFeatured: true,
    variants: [
      { size: "35ml", price: 18500, stock: 30, sku: "CH-NO5-35" },
      { size: "50ml", price: 28000, stock: 22, sku: "CH-NO5-50" },
      { size: "100ml", price: 48000, stock: 14, sku: "CH-NO5-100" },
    ],
  },
  {
    name: "Dior J'adore",
    slug: "dior-jadore",
    description:
      "A sun-soaked bouquet of ylang-ylang, Damascus rose, Sambac jasmine and Indian tuberose.",
    categorySlug: "floral",
    images: [IMG.u7, IMG.u2],
    variants: [
      { size: "30ml", price: 17000, stock: 25, sku: "DI-JADORE-30" },
      { size: "50ml", price: 26000, stock: 19, sku: "DI-JADORE-50" },
      { size: "100ml", price: 45000, stock: 11, sku: "DI-JADORE-100" },
    ],
  },
  {
    name: "Gucci Bloom",
    slug: "gucci-bloom",
    description:
      "An immersive white-floral garden of tuberose, jasmine bud and Rangoon creeper.",
    categorySlug: "floral",
    images: [IMG.u2, IMG.u7],
    variants: [
      { size: "30ml", price: 16500, stock: 24, sku: "GU-BLOOM-30" },
      { size: "50ml", price: 25500, stock: 17, sku: "GU-BLOOM-50" },
      { size: "100ml", price: 44000, stock: 9, sku: "GU-BLOOM-100" },
    ],
  },
  {
    name: "Marc Jacobs Daisy",
    slug: "marc-jacobs-daisy",
    description:
      "A playful daisy chain of wild strawberry, violet leaves and white wood — youthful and luminous.",
    categorySlug: "floral",
    images: [IMG.u17, IMG.u6],
    variants: [
      { size: "30ml", price: 12500, stock: 35, sku: "MJ-DAISY-30" },
      { size: "50ml", price: 19500, stock: 21, sku: "MJ-DAISY-50" },
      { size: "100ml", price: 32000, stock: 12, sku: "MJ-DAISY-100" },
    ],
  },

  // ── Woody ────────────────────────────────────────────
  {
    name: "Le Labo Santal 33",
    slug: "le-labo-santal-33",
    description:
      "Cult-favourite Australian sandalwood with cardamom, iris, violet and a leather-cedar drydown.",
    categorySlug: "woody",
    images: [IMG.u3, IMG.u18],
    isFeatured: true,
    variants: [
      { size: "15ml", price: 22000, stock: 28, sku: "LL-SANTAL33-15" },
      { size: "50ml", price: 56000, stock: 14, sku: "LL-SANTAL33-50" },
      { size: "100ml", price: 92000, stock: 7, sku: "LL-SANTAL33-100" },
    ],
  },
  {
    name: "Diptyque Tam Dao",
    slug: "diptyque-tam-dao",
    description:
      "A meditative sandalwood, named for a Vietnamese mountain monastery, with cedar and cypress.",
    categorySlug: "woody",
    images: [IMG.u18, IMG.u3],
    variants: [
      { size: "35ml", price: 36000, stock: 16, sku: "DIP-TAMDAO-35" },
      { size: "75ml", price: 64000, stock: 8, sku: "DIP-TAMDAO-75" },
    ],
  },
  {
    name: "Byredo Mojave Ghost",
    slug: "byredo-mojave-ghost",
    description:
      "A desert mirage of ambrette, sandalwood, magnolia and chantilly musk — softly cinematic.",
    categorySlug: "woody",
    images: [IMG.u12, IMG.u18],
    variants: [
      { size: "50ml", price: 52000, stock: 13, sku: "BY-MOJAVE-50" },
      { size: "100ml", price: 84000, stock: 6, sku: "BY-MOJAVE-100" },
    ],
  },

  // ── Citrus & Fresh ───────────────────────────────────
  {
    name: "Acqua di Parma Colonia",
    slug: "acqua-di-parma-colonia",
    description:
      "The 1916 Italian classic: Sicilian lemon and bitter orange over Bulgarian rose and patchouli.",
    categorySlug: "citrus-fresh",
    images: [IMG.adpColonia, IMG.adpAlt],
    isFeatured: true,
    variants: [
      { size: "50ml", price: 22000, stock: 20, sku: "ADP-COLONIA-50" },
      { size: "100ml", price: 38000, stock: 11, sku: "ADP-COLONIA-100" },
      { size: "180ml", price: 62000, stock: 5, sku: "ADP-COLONIA-180" },
    ],
  },
  {
    name: "Mugler Cologne",
    slug: "mugler-cologne",
    description:
      "An aromatic neroli and bergamot cologne grounded in clean white musk — fresh and ungendered.",
    categorySlug: "citrus-fresh",
    images: [IMG.u11, IMG.u19],
    variants: [
      { size: "100ml", price: 18500, stock: 22, sku: "MU-COL-100" },
      { size: "300ml", price: 38000, stock: 7, sku: "MU-COL-300" },
    ],
  },
  {
    name: "Calvin Klein CK One",
    slug: "ck-one",
    description:
      "The 1994 unisex blueprint: bergamot, cardamom and pineapple over jasmine, violet and musk.",
    categorySlug: "citrus-fresh",
    images: [IMG.u19, IMG.u11],
    variants: [
      { size: "50ml", price: 9000, stock: 40, sku: "CK-ONE-50" },
      { size: "100ml", price: 14500, stock: 28, sku: "CK-ONE-100" },
      { size: "200ml", price: 22500, stock: 15, sku: "CK-ONE-200" },
    ],
  },

  // ── Oriental & Amber ─────────────────────────────────
  {
    name: "Yves Saint Laurent Black Opium",
    slug: "ysl-black-opium",
    description:
      "Black coffee accord swirled into vanilla, white florals and pink pepper — addictive and nocturnal.",
    categorySlug: "oriental-amber",
    images: [IMG.u8, IMG.u15],
    isFeatured: true,
    variants: [
      { size: "30ml", price: 18000, stock: 26, sku: "YSL-BO-30" },
      { size: "50ml", price: 28500, stock: 18, sku: "YSL-BO-50" },
      { size: "90ml", price: 44000, stock: 10, sku: "YSL-BO-90" },
    ],
  },
  {
    name: "Guerlain Shalimar",
    slug: "guerlain-shalimar",
    description:
      "The 1925 oriental masterpiece: bergamot, iris and vanilla resting on smoky leather and tonka.",
    categorySlug: "oriental-amber",
    images: [IMG.shalimar, IMG.u8],
    variants: [
      { size: "50ml", price: 26000, stock: 12, sku: "GU-SHAL-50" },
      { size: "90ml", price: 42000, stock: 8, sku: "GU-SHAL-90" },
    ],
  },
  {
    name: "Tom Ford Black Orchid",
    slug: "tom-ford-black-orchid",
    description:
      "Dark truffle, ylang-ylang, black orchid and patchouli — opulent and unmistakably nocturnal.",
    categorySlug: "oriental-amber",
    images: [IMG.u15, IMG.u8],
    variants: [
      { size: "30ml", price: 22000, stock: 17, sku: "TF-BO-30" },
      { size: "50ml", price: 34000, stock: 10, sku: "TF-BO-50" },
      { size: "100ml", price: 56000, stock: 6, sku: "TF-BO-100" },
    ],
  },
  {
    name: "Maison Margiela Replica By the Fireplace",
    slug: "margiela-replica-by-the-fireplace",
    description:
      "A memory in a bottle: woodsmoke, chestnut, juniper berries and warm vanilla.",
    categorySlug: "oriental-amber",
    images: [IMG.u16, IMG.u4],
    variants: [
      { size: "30ml", price: 21000, stock: 19, sku: "MM-FIRE-30" },
      { size: "100ml", price: 48000, stock: 9, sku: "MM-FIRE-100" },
    ],
  },

  // ── Gourmand ─────────────────────────────────────────
  {
    name: "Thierry Mugler Angel",
    slug: "mugler-angel",
    description:
      "The 1992 gourmand pioneer: praline, red berries, honey and patchouli — celestial and divisive.",
    categorySlug: "gourmand",
    images: [IMG.u11, IMG.u2],
    isFeatured: true,
    variants: [
      { size: "25ml", price: 16500, stock: 22, sku: "MU-ANGEL-25" },
      { size: "50ml", price: 27500, stock: 14, sku: "MU-ANGEL-50" },
      { size: "100ml", price: 46000, stock: 0, sku: "MU-ANGEL-100" },
    ],
  },
  {
    name: "Lancôme La Vie Est Belle",
    slug: "lancome-la-vie-est-belle",
    description:
      "Iris, praline and patchouli woven into a sunlit gourmand — soft, sweet and confident.",
    categorySlug: "gourmand",
    images: [IMG.u17, IMG.u7],
    variants: [
      { size: "30ml", price: 17500, stock: 24, sku: "LA-LVEB-30" },
      { size: "50ml", price: 27000, stock: 16, sku: "LA-LVEB-50" },
      { size: "100ml", price: 45000, stock: 8, sku: "LA-LVEB-100" },
    ],
  },
  {
    name: "Kayali Vanilla 28",
    slug: "kayali-vanilla-28",
    description:
      "Madagascar vanilla, tonka and orchid layered with brown sugar — a modern niche gourmand.",
    categorySlug: "gourmand",
    images: [IMG.u6, IMG.u11],
    variants: [
      { size: "50ml", price: 24000, stock: 20, sku: "KA-V28-50" },
      { size: "100ml", price: 38000, stock: 11, sku: "KA-V28-100" },
    ],
  },

  // ── Musk ─────────────────────────────────────────────
  {
    name: "Narciso Rodriguez For Her",
    slug: "narciso-rodriguez-for-her",
    description:
      "The signature musk: skin-warm, slightly powdery, with rose, peach and amber.",
    categorySlug: "musk",
    images: [IMG.u9, IMG.u13],
    variants: [
      { size: "30ml", price: 17000, stock: 23, sku: "NR-FH-30" },
      { size: "50ml", price: 26500, stock: 15, sku: "NR-FH-50" },
      { size: "100ml", price: 44000, stock: 7, sku: "NR-FH-100" },
    ],
  },
  {
    name: "Maison Margiela Replica Lazy Sunday Morning",
    slug: "margiela-replica-lazy-sunday-morning",
    description:
      "Clean cotton, iris and white musk — the scent of fresh linens still warm from the dryer.",
    categorySlug: "musk",
    images: [IMG.u13, IMG.u9],
    variants: [
      { size: "30ml", price: 21000, stock: 18, sku: "MM-LSM-30" },
      { size: "100ml", price: 48000, stock: 8, sku: "MM-LSM-100" },
    ],
  },
  {
    name: "Kiehl's Original Musk",
    slug: "kiehls-original-musk",
    description:
      "The 1963 New York apothecary classic: white musk, bergamot, jasmine and rose absolute.",
    categorySlug: "musk",
    images: [IMG.u10, IMG.u9],
    variants: [
      { size: "50ml", price: 11500, stock: 32, sku: "KIEHL-OM-50" },
      { size: "100ml", price: 17500, stock: 19, sku: "KIEHL-OM-100" },
    ],
  },
];

async function main() {
  // ── Admin user ─────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const rawAdminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !rawAdminPassword) {
    throw new Error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables (.env.local)."
    );
  }

  const adminPassword = await bcrypt.hash(rawAdminPassword, 12);

  try {
    await prisma.user.updateMany({
      where: {
        email: { in: ["admin@houseofcohort.com", "admin@scentsl.com"] },
        NOT: { email: adminEmail },
      },
      data: {
        role: "CUSTOMER",
        password: null,
      },
    });
  } catch {
    // Ignore if legacy users don't exist
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // ── Categories ─────────────────────────────────────────
  const categoryBySlug = new Map<string, { id: string }>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: c.image },
      create: { name: c.name, slug: c.slug, image: c.image },
    });
    categoryBySlug.set(c.slug, row);
  }

  // ── Vendors ─────────────────────────────────────────────
  const vendorA = await prisma.vendor.upsert({
    where: { id: "vendor-a-lattafa" },
    update: {
      businessName: "Vendor A",
      ownerName: "Ahmad Al-Mansoor",
      phone: "+232 76 111 222",
      whatsapp: "+232 76 111 222",
      email: "vendora@scentsl.com",
      address: "12 Regent Road, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
    create: {
      id: "vendor-a-lattafa",
      businessName: "Vendor A",
      ownerName: "Ahmad Al-Mansoor",
      phone: "+232 76 111 222",
      whatsapp: "+232 76 111 222",
      email: "vendora@scentsl.com",
      address: "12 Regent Road, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
  });

  const vendorB = await prisma.vendor.upsert({
    where: { id: "vendor-b-armaf" },
    update: {
      businessName: "Vendor B",
      ownerName: "Fatmata Kamara",
      phone: "+232 78 333 444",
      whatsapp: "+232 78 333 444",
      email: "vendorb@scentsl.com",
      address: "45 Siaka Stevens Street, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
    create: {
      id: "vendor-b-armaf",
      businessName: "Vendor B",
      ownerName: "Fatmata Kamara",
      phone: "+232 78 333 444",
      whatsapp: "+232 78 333 444",
      email: "vendorb@scentsl.com",
      address: "45 Siaka Stevens Street, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
  });

  const vendorC = await prisma.vendor.upsert({
    where: { id: "vendor-c-oud" },
    update: {
      businessName: "Vendor C",
      ownerName: "Tariq Jalloh",
      phone: "+232 77 555 666",
      whatsapp: "+232 77 555 666",
      email: "vendorc@scentsl.com",
      address: "88 Wilberforce Street, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
    create: {
      id: "vendor-c-oud",
      businessName: "Vendor C",
      ownerName: "Tariq Jalloh",
      phone: "+232 77 555 666",
      whatsapp: "+232 77 555 666",
      email: "vendorc@scentsl.com",
      address: "88 Wilberforce Street, Freetown",
      status: "ACTIVE",
      commissionRate: 2.0,
    },
  });

  // Helper function to assign vendors based on requirements
  function getVendorForSlug(slug: string): string {
    // Vendor A: Lattafa Khamrah, Lattafa Yara, Afnan 9PM
    if (["lattafa-khamrah", "lattafa-yara", "afnan-9pm"].includes(slug)) {
      return vendorA.id;
    }
    // Vendor B: Armaf Club de Nuit, Lattafa Asad, Fakhar Black
    if (["armaf-club-de-nuit", "lattafa-asad", "fakhar-black"].includes(slug)) {
      return vendorB.id;
    }
    // Vendor C: Oud for Glory, Golden Oud, etc.
    if (["oud-for-glory", "golden-oud"].includes(slug)) {
      return vendorC.id;
    }
    // Distribute remaining products across A, B, C deterministically
    const code = slug.charCodeAt(0) % 3;
    return code === 0 ? vendorA.id : code === 1 ? vendorB.id : vendorC.id;
  }

  // ── Sample product (original) ──────────────────────────
  const oudCat = categoryBySlug.get("oud")!;
  await prisma.product.upsert({
    where: { slug: "golden-oud" },
    update: { vendorId: vendorC.id },
    create: {
      name: "Golden Oud",
      slug: "golden-oud",
      description: "A rich, woody fragrance with notes of oud and amber.",
      categoryId: oudCat.id,
      vendorId: vendorC.id,
      images: [],
      isFeatured: true,
      isActive: true,
      variants: {
        create: [
          { size: "50ml", price: 25000, stock: 20 },
          { size: "100ml", price: 45000, stock: 15 },
          { size: "200ml", price: 80000, stock: 8 },
        ],
      },
    },
  });

  // ── Perfume catalog ────────────────────────────────────
  for (const p of products) {
    const category = categoryBySlug.get(p.categorySlug);
    if (!category) {
      throw new Error(`Unknown category slug "${p.categorySlug}" for product "${p.name}"`);
    }
    const targetVendorId = getVendorForSlug(p.slug);

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId: category.id,
        vendorId: targetVendorId,
        images: p.images,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: category.id,
        vendorId: targetVendorId,
        images: p.images,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        variants: { create: p.variants },
      },
    });
  }

  // ── Delivery zones ─────────────────────────────────────
  await prisma.deliveryZone.createMany({
    skipDuplicates: true,
    data: [
      { name: "Freetown Central", fee: 2000 },
      { name: "East Freetown", fee: 3000 },
      { name: "West Freetown", fee: 3000 },
      { name: "Bo", fee: 10000 },
      { name: "Kenema", fee: 12000 },
    ],
  });

  const [catCount, prodCount, variantCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(
    `Seed complete — ${catCount} categories, ${prodCount} products, ${variantCount} variants.`,
  );
}

main().finally(() => prisma.$disconnect());
