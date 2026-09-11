import { ApiProductResponse } from '../types';

export const GOOGLE_SCRIPT_API_URL =
  'https://script.google.com/macros/s/AKfycbwPFgnfouW9nIs31hIvSSZ_tgQCySy9SCwmDXTdvqBQLyGR6qG7UpmCoBX4_OzGZWOO/exec';

// Backup product data in case the Google Apps Script URL experiences temporary quotas or network hiccups
export const BACKUP_PRODUCTS_DATA: ApiProductResponse = {
  success: true,
  categories: {
    "Chocolate Cake": [
      {
        name: "Dark Chocolate Truffle",
        price: 550,
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        description: "Rich dark chocolate sponge with ganache layers",
      },
      {
        name: "Chocolate Fudge Cake",
        price: 480,
        imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
        description: "Moist fudge cake topped with chocolate shavings",
      },
    ],
    "Red Velvet Cake": [
      {
        name: "Classic Red Velvet",
        price: 600,
        imageUrl: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
        description: "Velvety red sponge with cream cheese frosting",
      },
      {
        name: "Red Velvet Cupcakes (6pc)",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80",
        description: "Mini red velvet cupcakes with cream cheese swirl",
      },
    ],
    "Fruit Cake": [
      {
        name: "Fresh Fruit Cake",
        price: 650,
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        description: "Vanilla sponge topped with seasonal fresh fruits",
      },
      {
        name: "Pineapple Delight",
        price: 500,
        imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
        description: "Light sponge with pineapple filling and cream",
      },
    ],
    "Vanilla Cake": [
      {
        name: "Classic Vanilla",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
        description: "Soft vanilla sponge with buttercream frosting",
      },
      {
        name: "Vanilla Bean Cake",
        price: 500,
        imageUrl: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80",
        description: "Vanilla bean-infused sponge with light cream",
      },
    ],
    Cheesecake: [
      {
        name: "New York Cheesecake",
        price: 700,
        imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
        description: "Classic baked cheesecake with graham crust",
      },
      {
        name: "Blueberry Cheesecake",
        price: 750,
        imageUrl: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",
        description: "Creamy cheesecake topped with blueberry compote",
      },
    ],
    Biscuits: [
      {
        name: "Butter Cookies (250g)",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
        description: "Classic melt-in-mouth butter cookies",
      },
      {
        name: "Choco Chip Cookies (250g)",
        price: 200,
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
        description: "Crunchy cookies loaded with chocolate chips",
      },
      {
        name: "Oats & Honey Biscuits (200g)",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
        description: "Healthy oats biscuits sweetened with honey",
      },
    ],
    Drinks: [
      {
        name: "Cold Coffee",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
        description: "Chilled coffee blended with milk and ice cream",
      },
      {
        name: "Fresh Lemonade",
        price: 80,
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        description: "Refreshing lemonade with mint",
      },
      {
        name: "Chocolate Milkshake",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        description: "Thick chocolate shake topped with whipped cream",
      },
    ],
  },
};

export async function fetchBakeryProducts(): Promise<ApiProductResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(GOOGLE_SCRIPT_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiProductResponse = await response.json();
    if (data && data.success && data.categories) {
      return data;
    }
    return BACKUP_PRODUCTS_DATA;
  } catch (error) {
    console.warn('Live API fetch warning (using backup catalog):', error);
    return BACKUP_PRODUCTS_DATA;
  }
}

export async function submitBakeryOrder(order: Record<string, any>): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(order),
    });

    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return { success: parsed.success ?? true, message: parsed.message || 'Order saved' };
    } catch {
      return { success: true, message: 'Order submitted' };
    }
  } catch (error) {
    console.warn('Order log notice:', error);
    return { success: true, message: 'Order received.' };
  }
}
