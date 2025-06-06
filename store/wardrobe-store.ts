import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, Outfit, PlannedOutfit } from '@/types/wardrobe';
import { mockClothingItems, mockOutfits, mockPlannedOutfits } from '@/mocks/wardrobe';

interface WardrobeState {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  plannedOutfits: PlannedOutfit[];
  outfitPhotos: string[]; // Array of photo URIs
  
  // Clothing items actions
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'timesWorn'>) => void;
  updateClothingItem: (id: string, updates: Partial<ClothingItem>) => void;
  removeClothingItem: (id: string) => void;
  toggleFavoriteItem: (id: string) => void;
  incrementItemWorn: (id: string) => void;
  
  // Outfits actions
  addOutfit: (outfit: Omit<Outfit, 'id' | 'timesWorn'>) => void;
  updateOutfit: (id: string, updates: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;
  toggleFavoriteOutfit: (id: string) => void;
  incrementOutfitWorn: (id: string) => void;
  
  // Outfit photos actions
  addOutfitPhoto: (photoUri: string) => void;
  removeOutfitPhoto: (photoUri: string) => void;
  
  // Planned outfits actions
  planOutfit: (plannedOutfit: Omit<PlannedOutfit, 'id'>) => void;
  updatePlannedOutfit: (id: string, updates: Partial<PlannedOutfit>) => void;
  removePlannedOutfit: (id: string) => void;
  
  // Utility functions
  getItemById: (id: string) => ClothingItem | undefined;
  getOutfitById: (id: string) => Outfit | undefined;
  getPlannedOutfitsByDate: (date: string) => PlannedOutfit[];
  getOutfitItems: (outfitId: string) => ClothingItem[];
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      clothingItems: mockClothingItems,
      outfits: mockOutfits,
      plannedOutfits: mockPlannedOutfits,
      outfitPhotos: [],
      
      // Clothing items actions
      addClothingItem: (item) => set((state) => ({
        clothingItems: [...state.clothingItems, {
          ...item,
          id: Date.now().toString(),
          timesWorn: 0,
        }]
      })),
      
      updateClothingItem: (id, updates) => set((state) => ({
        clothingItems: state.clothingItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      
      removeClothingItem: (id) => set((state) => ({
        clothingItems: state.clothingItems.filter(item => item.id !== id)
      })),
      
      toggleFavoriteItem: (id) => set((state) => ({
        clothingItems: state.clothingItems.map(item => 
          item.id === id ? { ...item, favorite: !item.favorite } : item
        )
      })),
      
      incrementItemWorn: (id) => set((state) => ({
        clothingItems: state.clothingItems.map(item => 
          item.id === id ? { 
            ...item, 
            timesWorn: item.timesWorn + 1,
            lastWorn: new Date().toISOString().split('T')[0]
          } : item
        )
      })),
      
      // Outfits actions
      addOutfit: (outfit) => set((state) => ({
        outfits: [...state.outfits, {
          ...outfit,
          id: Date.now().toString(),
          timesWorn: 0,
        }]
      })),
      
      updateOutfit: (id, updates) => set((state) => ({
        outfits: state.outfits.map(outfit => 
          outfit.id === id ? { ...outfit, ...updates } : outfit
        )
      })),
      
      removeOutfit: (id) => set((state) => ({
        outfits: state.outfits.filter(outfit => outfit.id !== id)
      })),
      
      toggleFavoriteOutfit: (id) => set((state) => ({
        outfits: state.outfits.map(outfit => 
          outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit
        )
      })),
      
      incrementOutfitWorn: (id) => set((state) => {
        const outfit = state.outfits.find(o => o.id === id);
        if (outfit) {
          // Also increment all items in the outfit
          outfit.items.forEach(itemId => {
            get().incrementItemWorn(itemId);
          });
        }
        
        return {
          outfits: state.outfits.map(outfit => 
            outfit.id === id ? { 
              ...outfit, 
              timesWorn: outfit.timesWorn + 1,
              lastWorn: new Date().toISOString().split('T')[0]
            } : outfit
          )
        };
      }),
      
      // Outfit photos actions
      addOutfitPhoto: (photoUri) => set((state) => ({
        outfitPhotos: [...state.outfitPhotos, photoUri]
      })),
      
      removeOutfitPhoto: (photoUri) => set((state) => ({
        outfitPhotos: state.outfitPhotos.filter(uri => uri !== photoUri)
      })),
      
      // Planned outfits actions
      planOutfit: (plannedOutfit) => set((state) => ({
        plannedOutfits: [...state.plannedOutfits, {
          ...plannedOutfit,
          id: Date.now().toString(),
        }]
      })),
      
      updatePlannedOutfit: (id, updates) => set((state) => ({
        plannedOutfits: state.plannedOutfits.map(plan => 
          plan.id === id ? { ...plan, ...updates } : plan
        )
      })),
      
      removePlannedOutfit: (id) => set((state) => ({
        plannedOutfits: state.plannedOutfits.filter(plan => plan.id !== id)
      })),
      
      // Utility functions
      getItemById: (id) => {
        return get().clothingItems.find(item => item.id === id);
      },
      
      getOutfitById: (id) => {
        return get().outfits.find(outfit => outfit.id === id);
      },
      
      getPlannedOutfitsByDate: (date) => {
        return get().plannedOutfits.filter(plan => plan.date === date);
      },
      
      getOutfitItems: (outfitId) => {
        const outfit = get().getOutfitById(outfitId);
        if (!outfit) return [];
        
        return outfit.items
          .map(itemId => get().getItemById(itemId))
          .filter((item): item is ClothingItem => item !== undefined);
      }
    }),
    {
      name: 'wardrobe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);