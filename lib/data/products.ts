import { Collection, Product, ProductVariant } from '../types/product';

export const COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    description: 'Fresh graphics from Drop 001, cut for everyday chaos.',
  },
  {
    id: 'col-2',
    slug: 'best-sellers',
    name: 'Best Sellers',
    description: 'The pieces people keep reaching for.',
  },
  {
    id: 'col-3',
    slug: 'drop-001',
    name: 'Drop 001',
    description: 'Professionally Unsupervised. The launch capsule.',
  },
  {
    id: 'col-4',
    slug: 'dark-humor',
    name: 'Dark Humor',
    description: 'Dry delivery, clean print execution, premium blanks.',
  },
  {
    id: 'col-5',
    slug: 'blue-collar',
    name: 'Blue Collar',
    description: 'Work-shift energy and after-hours honesty.',
  },
  {
    id: 'col-6',
    slug: 'tattoo-culture',
    name: 'Tattoo Culture',
    description: 'Linework-driven graphics with grit and restraint.',
  },
];

type ProductSeed = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  collectionSlug: 'dark-humor' | 'blue-collar' | 'tattoo-culture';
  category: string;
  color: string;
  colorHex: string;
  featured: boolean;
  retailPrice: number;
  tags: string[];
  createdAt: string;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: 'prod-1',
    slug: 'professionally-unsupervised',
    name: 'Professionally Unsupervised',
    shortDescription: 'Clocked in. Supervised? Not exactly.',
    description: 'Heavy cotton tee with a sharp front graphic and soft hand feel.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: true,
    retailPrice: 36.0,
    tags: ['drop-001', 'best-seller', 'new-arrival'],
    createdAt: '2026-07-18',
  },
  {
    id: 'prod-2',
    slug: 'bad-decisions-department',
    name: 'Bad Decisions Department',
    shortDescription: 'Open enrollment, no interview required.',
    description: 'Premium-weight black tee with durable print and relaxed fit.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: true,
    retailPrice: 36.0,
    tags: ['drop-001', 'best-seller', 'new-arrival'],
    createdAt: '2026-07-16',
  },
  {
    id: 'prod-3',
    slug: 'clocked-out-mentally',
    name: 'Clocked Out Mentally',
    shortDescription: 'Present in body, unavailable in spirit.',
    description: 'Mid-weight charcoal blank with distressed-style front lockup.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: true,
    retailPrice: 36.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-07-14',
  },
  {
    id: 'prod-4',
    slug: 'not-my-circus',
    name: 'Not My Circus',
    shortDescription: 'Still somehow handling the monkeys.',
    description: 'Soft black tee with bold center print and clean neckline.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: true,
    retailPrice: 35.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-07-12',
  },
  {
    id: 'prod-5',
    slug: 'questionable-since-birth',
    name: 'Questionable Since Birth',
    shortDescription: 'Consistency is a personality trait.',
    description: 'Cream blank with dark print contrast and premium drape.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Bone',
    colorHex: '#f5f5dc',
    featured: true,
    retailPrice: 35.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-07-11',
  },
  {
    id: 'prod-6',
    slug: 'low-standards-club',
    name: 'Low Standards Club',
    shortDescription: 'Membership accepted at first glance.',
    description: 'Black heavyweight tee with crisp chest print placement.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: false,
    retailPrice: 34.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-07-10',
  },
  {
    id: 'prod-7',
    slug: 'certified-bad-influence',
    name: 'Certified Bad Influence',
    shortDescription: 'Issued with zero expiration date.',
    description: 'Structured black tee with balanced front graphic proportions.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: false,
    retailPrice: 36.0,
    tags: ['drop-001'],
    createdAt: '2026-07-09',
  },
  {
    id: 'prod-8',
    slug: 'running-on-caffeine-and-regret',
    name: 'Running on Caffeine & Regret',
    shortDescription: 'A balanced routine, technically.',
    description: 'Charcoal tee with durable print and everyday-wear weight.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: false,
    retailPrice: 35.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-07-08',
  },
  {
    id: 'prod-9',
    slug: 'hrs-favorite-employee',
    name: "HR's Favorite Employee",
    shortDescription: 'Filed under complicated personalities.',
    description: 'Bone tee with sharp dark print and premium neck rib.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Bone',
    colorHex: '#f5f5dc',
    featured: false,
    retailPrice: 35.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-07-07',
  },
  {
    id: 'prod-10',
    slug: 'todays-bad-idea',
    name: "Today's Bad Idea",
    shortDescription: 'Scheduled daily. Never postponed.',
    description: 'Black tee with oversized center print and smooth finish.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: false,
    retailPrice: 34.0,
    tags: ['drop-001'],
    createdAt: '2026-07-06',
  },
  {
    id: 'prod-11',
    slug: 'overqualified-underpaid',
    name: 'Overqualified Underpaid',
    shortDescription: 'A classic modern arrangement.',
    description: 'Charcoal blank, soft hand, and clean high-contrast print.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: false,
    retailPrice: 36.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-07-05',
  },
  {
    id: 'prod-12',
    slug: 'probably-fine',
    name: 'Probably Fine',
    shortDescription: 'A statement and a coping strategy.',
    description: 'Oxblood tee with premium print and structured silhouette.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Oxblood',
    colorHex: '#800000',
    featured: false,
    retailPrice: 37.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-07-04',
  },
  {
    id: 'prod-13',
    slug: 'do-not-encourage-me',
    name: 'Do Not Encourage Me',
    shortDescription: 'Feedback noted. Ignored respectfully.',
    description: 'Black heavyweight blank with compact chest treatment.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: false,
    retailPrice: 35.0,
    tags: ['drop-001'],
    createdAt: '2026-07-03',
  },
  {
    id: 'prod-14',
    slug: 'unsupervised-again',
    name: 'Unsupervised Again',
    shortDescription: 'Recurring event. Never accidental.',
    description: 'Bone cotton tee with durable print and breathable feel.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Bone',
    colorHex: '#f5f5dc',
    featured: false,
    retailPrice: 35.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-07-02',
  },
  {
    id: 'prod-15',
    slug: 'problem-solver-usually-the-problem',
    name: 'Problem Solver (Usually the Problem)',
    shortDescription: 'Multifunctional, for better or worse.',
    description: 'Charcoal blank with centered graphic and premium finish.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: false,
    retailPrice: 36.0,
    tags: ['drop-001'],
    createdAt: '2026-07-01',
  },
  {
    id: 'prod-16',
    slug: 'socially-optional',
    name: 'Socially Optional',
    shortDescription: 'Available in very limited conversation.',
    description: 'Black tee with precise print edges and smooth drape.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: false,
    retailPrice: 34.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-06-30',
  },
  {
    id: 'prod-17',
    slug: 'no-good-decisions-after-midnight',
    name: 'No Good Decisions After Midnight',
    shortDescription: 'Field-tested repeatedly.',
    description: 'Oxblood tee with oversized front statement and clean seams.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Oxblood',
    colorHex: '#800000',
    featured: false,
    retailPrice: 37.0,
    tags: ['drop-001', 'new-arrival'],
    createdAt: '2026-06-29',
  },
  {
    id: 'prod-18',
    slug: 'tattoo-therapy',
    name: 'Tattoo Therapy',
    shortDescription: 'Cheaper than a breakthrough, usually.',
    description: 'Black premium blank with linework-driven graphic treatment.',
    collectionSlug: 'tattoo-culture',
    category: 'T-Shirts',
    color: 'Black',
    colorHex: '#000000',
    featured: true,
    retailPrice: 36.0,
    tags: ['drop-001', 'best-seller', 'new-arrival'],
    createdAt: '2026-06-28',
  },
  {
    id: 'prod-19',
    slug: 'weekend-survival-kit',
    name: 'Weekend Survival Kit',
    shortDescription: 'Two days, same bad decisions.',
    description: 'Charcoal tee with balanced artwork and durable print setup.',
    collectionSlug: 'blue-collar',
    category: 'T-Shirts',
    color: 'Charcoal',
    colorHex: '#36454f',
    featured: false,
    retailPrice: 35.0,
    tags: ['drop-001'],
    createdAt: '2026-06-27',
  },
  {
    id: 'prod-20',
    slug: 'everything-is-fine',
    name: 'Everything Is Fine',
    shortDescription: 'Official statement under mild pressure.',
    description: 'Bone tee with clean print contrast and premium hand feel.',
    collectionSlug: 'dark-humor',
    category: 'T-Shirts',
    color: 'Bone',
    colorHex: '#f5f5dc',
    featured: true,
    retailPrice: 35.0,
    tags: ['drop-001', 'best-seller'],
    createdAt: '2026-06-26',
  },
];

function createImageSvg(name: string, colorHex: string): { src: string; alt: string } {
  const color = colorHex.replace('#', '%23');
  const text = encodeURIComponent(name.toUpperCase());

  const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23181614'/%3E%3Cstop offset='100%25' stop-color='%230b0b0a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1000' height='1000' fill='url(%23bg)'/%3E%3Cpath d='M500 156c-60 0-115 17-165 44l-72 40-80-49-93 116 85 63 52-48 18 454h510l18-454 52 48 85-63-93-116-80 49-72-40c-50-27-105-44-165-44z' fill='${color}'/%3E%3Cpath d='M500 208c-36 0-70 11-95 29l29 37c19-11 41-17 66-17s47 6 66 17l29-37c-25-18-59-29-95-29z' fill='%230f0f0f' fill-opacity='.35'/%3E%3Ctext x='500' y='560' text-anchor='middle' fill='%23f2ecde' font-family='Arial Narrow, Arial, sans-serif' font-size='40' font-weight='700' letter-spacing='6'%3E${text}%3C/text%3E%3C/svg%3E`;

  return {
    src: svg,
    alt: `${name} shirt`,
  };
}

function createVariants(seed: ProductSeed): ProductVariant[] {
  const sizes = ['S', 'M', 'L', 'XL'];
  return sizes.map((size, index) => ({
    id: `${seed.id}-var-${size.toLowerCase()}`,
    printfulVariantId: `${seed.id}-pf-${index + 1}`,
    name: `${seed.color} - ${size}`,
    size,
    color: seed.color,
    colorHex: seed.colorHex,
    sku: `${seed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}-${size}`,
    retailPrice: seed.retailPrice,
    available: true,
  }));
}

export const DEMO_PRODUCTS: Product[] = PRODUCT_SEEDS.map((seed) => {
  const image = createImageSvg(seed.name, seed.colorHex);
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    shortDescription: seed.shortDescription,
    description: seed.description,
    category: seed.category,
    collectionSlug: seed.collectionSlug,
    active: true,
    featured: seed.featured,
    images: [
      {
        id: `${seed.id}-img-1`,
        src: image.src,
        alt: image.alt,
      },
    ],
    basePrice: 19.99,
    retailPrice: seed.retailPrice,
    currency: 'USD',
    variants: createVariants(seed),
    tags: seed.tags,
    createdAt: new Date(seed.createdAt),
    updatedAt: new Date(seed.createdAt),
  };
});

export function getProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((product) => product.slug === slug);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  if (collectionSlug === 'drop-001') {
    return DEMO_PRODUCTS.filter((product) => product.active && product.tags.includes('drop-001'));
  }

  if (collectionSlug === 'new-arrivals') {
    return DEMO_PRODUCTS
      .filter((product) => product.active && product.tags.includes('new-arrival'))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  if (collectionSlug === 'best-sellers') {
    return DEMO_PRODUCTS.filter((product) => product.active && product.tags.includes('best-seller'));
  }

  return DEMO_PRODUCTS.filter((product) => product.collectionSlug === collectionSlug && product.active);
}

export function getFeaturedProducts(): Product[] {
  return DEMO_PRODUCTS.filter((product) => product.featured && product.active);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getAllCollections(): Collection[] {
  return COLLECTIONS;
}
