import { create } from 'zustand';
import { ClothingItem, Occasion, Season } from '@/types/wardrobe';
import { useWardrobeStore } from './wardrobe-store';

interface AIRequest {
  occasion?: Occasion;
  season?: Season;
  weather?: string;
  colors?: string[];
  mood?: string;
  excludeItems?: string[];
  stylePreference?: string;
}

interface StyleAdvice {
  title: string;
  advice: string;
}

interface SimilarOutfit {
  id: string;
  imageUrl: string;
  title: string;
  source: string;
  sourceUrl: string;
  similarityScore: number;
  price?: string;
  brand?: string;
}

interface AIState {
  isGenerating: boolean;
  isAnalyzing: boolean;
  lastRequest: AIRequest | null;
  styleAdvice: StyleAdvice[];
  
  generateOutfit: (request: AIRequest) => Promise<string[]>;
  getOutfitSuggestion: (request: AIRequest) => Promise<ClothingItem[]>;
  analyzeOutfitPhoto: (photoUri: string) => Promise<{
    items: string[];
    style: string;
    suggestions: string[];
  }>;
  findSimilarOutfits: (photoUri: string) => Promise<SimilarOutfit[]>;
  removeBackground: (photoUri: string) => Promise<string>;
  getStyleAdvice: (query: string) => Promise<string>;
  getPersonalizedStyleTips: () => Promise<StyleAdvice[]>;
  findSimilarOutfitsOnline: (photoUri: string) => Promise<SimilarOutfit[]>;
}

// Mock data for similar outfits (simulating Google Lens-like results)
const mockOnlineOutfits: SimilarOutfit[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Casual Summer Outfit with White Tee and Jeans',
    source: 'Pinterest',
    sourceUrl: 'https://pinterest.com',
    similarityScore: 92,
    price: '$120',
    brand: 'Zara'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Street Style Look with Denim',
    source: 'Instagram',
    sourceUrl: 'https://instagram.com',
    similarityScore: 87,
    price: '$95',
    brand: 'H&M'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Minimalist Outfit for Spring',
    source: 'ASOS',
    sourceUrl: 'https://asos.com',
    similarityScore: 78,
    price: '$150',
    brand: 'ASOS'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Urban Style with Leather Jacket',
    source: 'Zara',
    sourceUrl: 'https://zara.com',
    similarityScore: 73,
    price: '$180',
    brand: 'AllSaints'
  },
];

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  isAnalyzing: false,
  lastRequest: null,
  styleAdvice: [],
  
  generateOutfit: async (request) => {
    set({ isGenerating: true, lastRequest: request });
    
    try {
      // In a real app, this would call an AI API
      // For now, we'll simulate a response with more sophisticated logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const wardrobeStore = useWardrobeStore.getState();
      const availableItems = wardrobeStore.clothingItems;
      
      // Filter by occasion and season if provided
      let filteredItems = availableItems;
      if (request.occasion) {
        filteredItems = filteredItems.filter(item => 
          item.occasions.includes(request.occasion as Occasion)
        );
      }
      
      if (request.season) {
        filteredItems = filteredItems.filter(item => 
          item.seasons.includes(request.season as Season) || 
          item.seasons.includes('all')
        );
      }
      
      // Filter by colors if provided
      if (request.colors && request.colors.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.colors.some(color => request.colors?.includes(color))
        );
      }
      
      // Exclude specific items if requested
      if (request.excludeItems && request.excludeItems.length > 0) {
        filteredItems = filteredItems.filter(item => 
          !request.excludeItems?.includes(item.id)
        );
      }
      
      // More sophisticated outfit creation logic
      const outfit: string[] = [];
      
      // Try to add one top
      const tops = filteredItems.filter(item => item.category === 'tops');
      if (tops.length > 0) {
        // Prioritize favorite items
        const favoriteTops = tops.filter(item => item.favorite);
        if (favoriteTops.length > 0 && Math.random() > 0.3) {
          outfit.push(favoriteTops[Math.floor(Math.random() * favoriteTops.length)].id);
        } else {
          outfit.push(tops[Math.floor(Math.random() * tops.length)].id);
        }
      }
      
      // Try to add one bottom or dress (not both)
      const bottoms = filteredItems.filter(item => item.category === 'bottoms');
      const dresses = filteredItems.filter(item => item.category === 'dresses');
      
      // If we have a style preference for dresses and dresses are available, prioritize them
      if (dresses.length > 0 && (request.stylePreference === 'dresses' || Math.random() > 0.6)) {
        // Remove the top if we added one
        outfit.pop();
        
        // Prioritize favorite dresses
        const favoriteDresses = dresses.filter(item => item.favorite);
        if (favoriteDresses.length > 0 && Math.random() > 0.3) {
          outfit.push(favoriteDresses[Math.floor(Math.random() * favoriteDresses.length)].id);
        } else {
          outfit.push(dresses[Math.floor(Math.random() * dresses.length)].id);
        }
      } else if (bottoms.length > 0) {
        // Prioritize favorite bottoms
        const favoriteBottoms = bottoms.filter(item => item.favorite);
        if (favoriteBottoms.length > 0 && Math.random() > 0.3) {
          outfit.push(favoriteBottoms[Math.floor(Math.random() * favoriteBottoms.length)].id);
        } else {
          outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)].id);
        }
      }
      
      // Try to add outerwear if it's fall or winter or if weather is cold
      if (request.season === 'fall' || request.season === 'winter' || request.weather === 'cold') {
        const outerwear = filteredItems.filter(item => item.category === 'outerwear');
        if (outerwear.length > 0) {
          // Prioritize favorite outerwear
          const favoriteOuterwear = outerwear.filter(item => item.favorite);
          if (favoriteOuterwear.length > 0 && Math.random() > 0.3) {
            outfit.push(favoriteOuterwear[Math.floor(Math.random() * favoriteOuterwear.length)].id);
          } else {
            outfit.push(outerwear[Math.floor(Math.random() * outerwear.length)].id);
          }
        }
      }
      
      // Try to add shoes
      const shoes = filteredItems.filter(item => item.category === 'shoes');
      if (shoes.length > 0) {
        // Prioritize favorite shoes
        const favoriteShoes = shoes.filter(item => item.favorite);
        if (favoriteShoes.length > 0 && Math.random() > 0.3) {
          outfit.push(favoriteShoes[Math.floor(Math.random() * favoriteShoes.length)].id);
        } else {
          outfit.push(shoes[Math.floor(Math.random() * shoes.length)].id);
        }
      }
      
      // Try to add accessories - more likely for formal occasions
      const accessories = filteredItems.filter(item => item.category === 'accessories');
      if (accessories.length > 0 && (request.occasion === 'formal' || request.occasion === 'special' || Math.random() > 0.3)) {
        // Prioritize favorite accessories
        const favoriteAccessories = accessories.filter(item => item.favorite);
        if (favoriteAccessories.length > 0 && Math.random() > 0.3) {
          outfit.push(favoriteAccessories[Math.floor(Math.random() * favoriteAccessories.length)].id);
        } else {
          outfit.push(accessories[Math.floor(Math.random() * accessories.length)].id);
        }
      }
      
      return outfit;
    } catch (error) {
      console.error('Error generating outfit:', error);
      return [];
    } finally {
      set({ isGenerating: false });
    }
  },
  
  getOutfitSuggestion: async (request) => {
    const itemIds = await get().generateOutfit(request);
    const wardrobeStore = useWardrobeStore.getState();
    
    return itemIds
      .map(id => wardrobeStore.getItemById(id))
      .filter((item): item is ClothingItem => item !== undefined);
  },

  analyzeOutfitPhoto: async (photoUri) => {
    set({ isAnalyzing: true });
    
    try {
      // In a real app, this would call an AI API to analyze the photo
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate AI analysis results
      const wardrobeStore = useWardrobeStore.getState();
      const allItems = wardrobeStore.clothingItems;
      
      // Randomly select 2-4 items to simulate detected items
      const shuffled = [...allItems].sort(() => 0.5 - Math.random());
      const detectedItems = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
      
      return {
        items: detectedItems.map(item => item.id),
        style: ['casual', 'formal', 'streetwear', 'minimalist', 'bohemian'][Math.floor(Math.random() * 5)],
        suggestions: [
          'Try adding a statement accessory to elevate this look',
          'This outfit would work well with a light jacket for cooler evenings',
          'Consider a different color shoe to create more contrast',
          'This is a great base outfit that you can dress up or down',
        ],
      };
    } catch (error) {
      console.error('Error analyzing outfit photo:', error);
      return {
        items: [],
        style: '',
        suggestions: [],
      };
    } finally {
      set({ isAnalyzing: false });
    }
  },

  findSimilarOutfits: async (photoUri) => {
    try {
      // In a real app, this would call an AI API to find similar outfits online
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      return mockOnlineOutfits;
    } catch (error) {
      console.error('Error finding similar outfits:', error);
      return [];
    }
  },

  findSimilarOutfitsOnline: async (photoUri) => {
    try {
      // In a real implementation, this would use Google Cloud Vision API
      // For demonstration purposes, we'll simulate the API call
      
      // Simulate API call to Google Cloud Vision API
      console.log('Simulating Google Cloud Vision API call with image:', photoUri);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate random similarity scores to make each call feel unique
      const results = mockOnlineOutfits.map(outfit => ({
        ...outfit,
        similarityScore: Math.floor(Math.random() * 15) + (100 - parseInt(outfit.id) * 5)
      }));
      
      // Sort by similarity score
      return results.sort((a, b) => b.similarityScore - a.similarityScore);
    } catch (error) {
      console.error('Error searching similar outfits online:', error);
      return [];
    }
  },

  removeBackground: async (photoUri) => {
    try {
      // In a real implementation, this would call a background removal API like Remove.bg
      console.log('Simulating background removal API call with image:', photoUri);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, we'll just return the original image
      // In a real app, this would be a processed image with the background removed
      return photoUri;
    } catch (error) {
      console.error('Error removing background:', error);
      return photoUri;
    }
  },

  getStyleAdvice: async (query) => {
    try {
      // In a real app, this would call an AI API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate AI response based on query keywords
      if (query.includes('interview')) {
        return "For interviews, opt for a tailored blazer with matching pants or a knee-length skirt. Choose neutral colors like navy, gray, or black. Keep accessories minimal and professional. Make sure your clothes are well-pressed and fit properly to make the best impression.";
      } else if (query.includes('date')) {
        return "For a date, wear something that makes you feel confident but comfortable. A nice top with jeans and boots is perfect for casual dates, while a dress or button-up shirt works well for more formal settings. Add a signature accessory that can be a conversation starter.";
      } else if (query.includes('wedding')) {
        return "For a wedding, follow the dress code if specified. For semi-formal, men can wear a suit without a tie, and women can wear a cocktail dress. Avoid white (reserved for the bride) and anything too revealing or casual. Consider the venue and season when choosing fabrics and styles.";
      } else if (query.includes('casual')) {
        return "For a polished casual look, try combining well-fitted jeans with a structured top or a casual button-down. Add a quality pair of sneakers or loafers and a simple accessory like a watch or minimal jewelry. This creates an effortless yet put-together appearance.";
      } else {
        return "To elevate your personal style, focus on fit first - well-tailored clothes instantly look more expensive. Build a versatile wardrobe with quality basics in neutral colors that mix and match easily. Add personality with 1-2 statement pieces or accessories. Remember, consistent style is more important than following every trend.";
      }
    } catch (error) {
      console.error('Error getting style advice:', error);
      return "I'm having trouble providing style advice right now. Please try again later.";
    }
  },

  getPersonalizedStyleTips: async () => {
    try {
      // In a real app, this would analyze the user's wardrobe and preferences
      // For now, we'll return generic style tips
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tips = [
        {
          title: "Color Coordination",
          advice: "Based on your wardrobe, you have many items in blue and neutral tones. Try adding a few pieces in complementary colors like rust or mustard to create more dynamic outfits."
        },
        {
          title: "Layering Strategy",
          advice: "You have several great basic pieces. Try layering them in unexpected ways - like a button-up under a sweater with just the collar and cuffs showing."
        },
        {
          title: "Accessorizing",
          advice: "Your outfits could benefit from more accessories. Consider adding scarves, statement jewelry, or watches to elevate your everyday looks."
        },
        {
          title: "Wardrobe Gaps",
          advice: "You have many casual pieces but could use more versatile items that transition from day to night. Consider adding a blazer or structured jacket."
        },
        {
          title: "Outfit Formula",
          advice: "For your body type and style preferences, try this formula: fitted top + mid or high-rise bottom + third piece (jacket/cardigan) + simple shoe + one statement accessory."
        }
      ];
      
      set({ styleAdvice: tips });
      return tips;
    } catch (error) {
      console.error('Error getting personalized style tips:', error);
      return [];
    }
  }
}));