import { ClothingItem, Outfit } from '@/types/wardrobe';

export const mockClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'White T-Shirt',
    category: 'tops',
    imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['white'],
    seasons: ['spring', 'summer', 'fall'],
    occasions: ['casual'],
    brand: 'Uniqlo',
    timesWorn: 12,
    lastWorn: '2025-05-20',
    favorite: true,
    notes: 'Super comfortable basic tee'
  },
  {
    id: '2',
    name: 'Blue Jeans',
    category: 'bottoms',
    imageUri: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['blue'],
    seasons: ['all'],
    occasions: ['casual'],
    brand: 'Levi\'s',
    timesWorn: 25,
    lastWorn: '2025-05-22',
    favorite: true,
    notes: 'Classic 501s'
  },
  {
    id: '3',
    name: 'Black Blazer',
    category: 'outerwear',
    imageUri: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['black'],
    seasons: ['fall', 'winter', 'spring'],
    occasions: ['work', 'formal'],
    brand: 'Zara',
    timesWorn: 8,
    lastWorn: '2025-05-15',
    favorite: false
  },
  {
    id: '4',
    name: 'Floral Dress',
    category: 'dresses',
    imageUri: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['multicolor'],
    seasons: ['spring', 'summer'],
    occasions: ['casual', 'special'],
    brand: 'H&M',
    timesWorn: 3,
    lastWorn: '2025-04-10',
    favorite: true
  },
  {
    id: '5',
    name: 'White Sneakers',
    category: 'shoes',
    imageUri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['white'],
    seasons: ['all'],
    occasions: ['casual', 'athletic'],
    brand: 'Nike',
    timesWorn: 30,
    lastWorn: '2025-05-25',
    favorite: true
  },
  {
    id: '6',
    name: 'Black Dress Shoes',
    category: 'shoes',
    imageUri: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['black'],
    seasons: ['all'],
    occasions: ['work', 'formal'],
    brand: 'Cole Haan',
    timesWorn: 10,
    lastWorn: '2025-05-18',
    favorite: false
  },
  {
    id: '7',
    name: 'Beige Sweater',
    category: 'tops',
    imageUri: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['beige'],
    seasons: ['fall', 'winter'],
    occasions: ['casual', 'work'],
    brand: 'Madewell',
    timesWorn: 15,
    lastWorn: '2025-03-10',
    favorite: true
  },
  {
    id: '8',
    name: 'Black Leather Jacket',
    category: 'outerwear',
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    colors: ['black'],
    seasons: ['fall', 'winter', 'spring'],
    occasions: ['casual'],
    brand: 'AllSaints',
    timesWorn: 20,
    lastWorn: '2025-04-15',
    favorite: true
  }
];

export const mockOutfits: Outfit[] = [
  {
    id: '1',
    name: 'Casual Weekend',
    items: ['1', '2', '5'],
    occasion: 'casual',
    seasons: ['spring', 'summer', 'fall'],
    favorite: true,
    lastWorn: '2025-05-22',
    timesWorn: 5,
    notes: 'Go-to weekend outfit'
  },
  {
    id: '2',
    name: 'Business Meeting',
    items: ['3', '2', '6'],
    occasion: 'work',
    seasons: ['fall', 'winter', 'spring'],
    favorite: false,
    lastWorn: '2025-05-15',
    timesWorn: 3
  },
  {
    id: '3',
    name: 'Summer Party',
    items: ['4', '5'],
    occasion: 'special',
    seasons: ['summer'],
    favorite: true,
    lastWorn: '2025-04-10',
    timesWorn: 1
  },
  {
    id: '4',
    name: 'Fall Casual',
    items: ['7', '2', '5'],
    occasion: 'casual',
    seasons: ['fall'],
    favorite: true,
    lastWorn: '2025-03-10',
    timesWorn: 4
  }
];

export const mockPlannedOutfits = [
  {
    id: '1',
    date: '2025-05-27',
    outfitId: '2',
    event: 'Work Presentation'
  },
  {
    id: '2',
    date: '2025-05-29',
    outfitId: '3',
    event: 'Dinner with Friends'
  },
  {
    id: '3',
    date: '2025-05-31',
    outfitId: '1',
    event: 'Weekend Errands'
  }
];