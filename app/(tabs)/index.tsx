import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Sparkles, Shirt, Clock, Camera } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { useAIStore } from '@/store/ai-store';
import theme from '@/constants/theme';
import OutfitCard from '@/components/OutfitCard';
import ClothingItem from '@/components/ClothingItem';
import OutfitSuggestion from '@/components/OutfitSuggestion';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import WeatherWidget from '@/components/WeatherWidget';

export default function HomeScreen() {
  const router = useRouter();
  const { clothingItems, outfits, addOutfit, outfitPhotos } = useWardrobeStore();
  const { getOutfitSuggestion, isGenerating } = useAIStore();
  const [suggestedOutfit, setSuggestedOutfit] = useState<any[]>([]);
  
  const favoriteItems = clothingItems.filter(item => item.favorite);
  const recentOutfits = [...outfits].sort((a, b) => {
    if (!a.lastWorn) return 1;
    if (!b.lastWorn) return -1;
    return new Date(b.lastWorn).getTime() - new Date(a.lastWorn).getTime();
  }).slice(0, 5);
  
  useEffect(() => {
    generateOutfitSuggestion();
  }, []);
  
  const generateOutfitSuggestion = async () => {
    // Get current season based on month
    const month = new Date().getMonth();
    let season: 'spring' | 'summer' | 'fall' | 'winter';
    
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';
    
    const items = await getOutfitSuggestion({
      season,
      occasion: 'casual',
    });
    
    setSuggestedOutfit(items);
  };
  
  const handleSaveOutfit = () => {
    if (suggestedOutfit.length < 2) return;
    
    addOutfit({
      name: "Today's Outfit",
      items: suggestedOutfit.map(item => item.id),
      occasion: 'casual',
      seasons: ['all'],
      favorite: false,
      notes: '',
    });
    
    // Generate a new suggestion
    generateOutfitSuggestion();
  };
  
  const navigateToCaptureOutfit = () => {
    router.push('/capture-outfit');
  };

  const navigateToAIStyler = () => {
    router.push('/ai-styler');
  };
  
  const navigateToAIClothingAnalysis = () => {
    router.push('/ai-clothing-analysis');
  };
  
  if (clothingItems.length === 0) {
    return (
      <EmptyState
        title="Welcome to Modachron"
        message="Start by adding items to your wardrobe to get personalized outfit suggestions."
        buttonTitle="Add Clothing"
        onButtonPress={() => router.push('/wardrobe')}
      />
    );
  }
  
  // Get the latest outfit photo if available
  const latestPhoto = outfitPhotos && outfitPhotos.length > 0 
    ? outfitPhotos[outfitPhotos.length - 1] 
    : null;
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>What will you wear today?</Text>
        </View>
        <Pressable
          style={styles.captureButton}
          onPress={navigateToCaptureOutfit}
        >
          <Camera size={24} color={theme.colors.primary} />
        </Pressable>
      </View>
      
      <WeatherWidget />
      
      <OutfitSuggestion
        items={suggestedOutfit}
        onSaveOutfit={handleSaveOutfit}
        onRegenerateOutfit={generateOutfitSuggestion}
        isLoading={isGenerating}
      />

      <View style={styles.aiCardsContainer}>
        <Pressable 
          style={styles.aiCard}
          onPress={navigateToAIStyler}
        >
          <View style={styles.aiCardIcon}>
            <Sparkles size={24} color="#FFFFFF" />
          </View>
          <View style={styles.aiCardTextContainer}>
            <Text style={styles.aiCardTitle}>AI Style Assistant</Text>
            <Text style={styles.aiCardDescription}>
              Get personalized style advice
            </Text>
          </View>
        </Pressable>
        
        <Pressable 
          style={[styles.aiCard, styles.aiCardSecondary]}
          onPress={navigateToAIClothingAnalysis}
        >
          <View style={[styles.aiCardIcon, styles.aiCardIconSecondary]}>
            <Shirt size={24} color="#FFFFFF" />
          </View>
          <View style={styles.aiCardTextContainer}>
            <Text style={styles.aiCardTitle}>AI Clothing Analysis</Text>
            <Text style={styles.aiCardDescription}>
              Analyze items with AI
            </Text>
          </View>
        </Pressable>
      </View>
      
      {latestPhoto && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Camera size={18} color={theme.colors.text} />
              <Text style={styles.sectionTitle}>Latest Outfit Photo</Text>
            </View>
            <Button
              title="Take New"
              variant="outline"
              size="small"
              onPress={navigateToCaptureOutfit}
            />
          </View>
          
          <Pressable 
            style={styles.latestPhotoContainer}
            onPress={() => router.push({
              pathname: '/ai-outfit-analysis',
              params: { photoUri: encodeURIComponent(latestPhoto) }
            })}
          >
            <Image
              source={{ uri: latestPhoto }}
              style={styles.latestPhoto}
              contentFit="cover"
            />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoOverlayText}>Analyze this outfit with AI</Text>
            </View>
          </Pressable>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Clock size={18} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Recent Outfits</Text>
          </View>
          <Button
            title="See All"
            variant="outline"
            size="small"
            onPress={() => router.push('/wardrobe')}
          />
        </View>
        
        {recentOutfits.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recentOutfits.map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onPress={() => router.push(`/outfit/${outfit.id}`)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No outfits yet. Create your first outfit!</Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Sparkles size={18} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Favorite Items</Text>
          </View>
          <Button
            title="See All"
            variant="outline"
            size="small"
            onPress={() => router.push('/wardrobe')}
          />
        </View>
        
        {favoriteItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {favoriteItems.map(item => (
              <ClothingItem
                key={item.id}
                item={item}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorite items yet. Mark some as favorites!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  greeting: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  captureButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.m,
  },
  emptyContainer: {
    padding: theme.spacing.l,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  latestPhotoContainer: {
    marginHorizontal: theme.spacing.m,
    height: 200,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    position: 'relative',
  },
  latestPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.s,
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.s,
    fontWeight: '500',
    textAlign: 'center',
  },
  aiCardsContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    gap: theme.spacing.m,
  },
  aiCard: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCardSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  aiCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  aiCardIconSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  aiCardTextContainer: {
    flex: 1,
  },
  aiCardTitle: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiCardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.fontSize.s,
  },
});