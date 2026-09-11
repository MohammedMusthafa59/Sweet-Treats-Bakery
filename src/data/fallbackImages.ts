// Curated high-resolution bakery photography with webp optimization and responsive sizing
export const FALLBACK_IMAGES: Record<string, string> = {
  // Chocolate Cakes
  "Dark Chocolate Truffle":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  "Chocolate Fudge Cake":
    "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",

  // Red Velvet
  "Classic Red Velvet":
    "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
  "Red Velvet Cupcakes (6pc)":
    "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80",

  // Fruit Cakes
  "Fresh Fruit Cake":
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
  "Pineapple Delight":
    "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",

  // Vanilla Cakes
  "Classic Vanilla":
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
  "Vanilla Bean Cake":
    "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80",

  // Cheesecakes
  "New York Cheesecake":
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
  "Blueberry Cheesecake":
    "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",

  // Biscuits & Cookies
  "Butter Cookies (250g)":
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  "Choco Chip Cookies (250g)":
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
  "Oats & Honey Biscuits (200g)":
    "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",

  // Drinks
  "Cold Coffee":
    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
  "Fresh Lemonade":
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  "Chocolate Milkshake":
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
};

// Generic category fallbacks in case new items are added dynamically
export const CATEGORY_FALLBACKS: Record<string, string> = {
  "Chocolate Cake":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  "Red Velvet Cake":
    "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
  "Fruit Cake":
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
  "Vanilla Cake":
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
  Cheesecake:
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
  Biscuits:
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  Drinks:
    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_BAKERY_IMAGE =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80";

export function getProductImage(productName: string, category?: string, originalUrl?: string): string {
  // If original URL is a valid non-example URL, prefer it
  if (originalUrl && !originalUrl.includes("example.com")) {
    return originalUrl;
  }
  if (FALLBACK_IMAGES[productName]) {
    return FALLBACK_IMAGES[productName];
  }
  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }
  return DEFAULT_BAKERY_IMAGE;
}
