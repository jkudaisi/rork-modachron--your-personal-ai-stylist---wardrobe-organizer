export type ClothingCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'outerwear' 
  | 'dresses' 
  | 'shoes' 
  | 'accessories';

export type ClothingColor = 
  | 'black' 
  | 'white' 
  | 'gray' 
  | 'beige' 
  | 'brown' 
  | 'navy' 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'pink' 
  | 'purple' 
  | 'yellow' 
  | 'orange' 
  | 'multicolor';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

export type Occasion = 
  | 'casual' 
  | 'work' 
  | 'formal' 
  | 'athletic' 
  | 'special';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageUri: string;
  colors: ClothingColor[];
  seasons: Season[];
  occasions: Occasion[];
  brand?: string;
  timesWorn: number;
  lastWorn?: string; // ISO date string
  favorite: boolean;
  notes?: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[]; // Array of clothing item IDs
  occasion: Occasion;
  seasons: Season[];
  favorite: boolean;
  lastWorn?: string; // ISO date string
  timesWorn: number;
  notes?: string;
}

export interface PlannedOutfit {
  id: string;
  date: string; // ISO date string
  outfitId: string;
  event?: string;
}