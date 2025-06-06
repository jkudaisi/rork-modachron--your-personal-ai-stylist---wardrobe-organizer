import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { RefreshCw, Calendar, Cloud, Sparkles, Thermometer, Umbrella, Sun, Zap } from 'lucide-react-native';
import { useAIStore } from '@/store/ai-store';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';
import { ClothingItem, Occasion, Season } from '@/types/wardrobe';

export default function OutfitGeneratorScreen() {
  const router = useRouter();
  const { getOutfitSuggestion, isGenerating } = useAIStore();
  const { addOutfit } = useWardrobeStore();
  
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [weather, setWeather] = useState<string>('mild');
  const [mood, setMood] = useState<string>('casual');
  const [suggestedOutfit, setSuggestedOutfit] = useState<ClothingItem[]>([]);
  
  const occasions: Occasion[] = ['casual', 'work', 'formal', 'athletic', 'special'];
  const weatherOptions = ['cold', 'mild', 'hot', 'rainy'];
  const moodOptions = ['casual', 'professional', 'creative', 'bold', 'minimal'];
  
  useEffect(() => {
    generateOutfit();
  }, []);
  
  const generateOutfit = async () => {
    // Get current season based on month
    const month = new Date().getMonth();
    let season: Season;
    
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';
    
    const items = await getOutfitSuggestion({
      season,
      occasion,
      weather,
      mood,
    });
    
    setSuggestedOutfit(items);
  };
  
  const handleSaveOutfit = () => {
    if (suggestedOutfit.length < 2) return;
    
    addOutfit({
      name: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Outfit`,
      items: suggestedOutfit.map(item => item.id),
      occasion,
      seasons: ['all'],
      favorite: false,
      notes: `Generated for ${weather} weather with a ${mood} mood.`,
    });
    
    router.push('/');
  };
  
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'cold':
        return <Thermometer size={20} color="#FFFFFF" />;
      case 'hot':
        return <Sun size={20} color="#FFFFFF" />;
      case 'rainy':
        return <Umbrella size={20} color="#FFFFFF" />;
      default:
        return <Cloud size={20} color="#FFFFFF" />;
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'AI Outfit Generator' }} />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Generate Your Perfect Outfit</Text>
          <Text style={styles.subtitle}>
            Let our AI create the ideal outfit based on your preferences
          </Text>
        </View>
        
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Occasion</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {occasions.map(o => (
              <Pressable
                key={o}
                style={[
                  styles.optionButton,
                  occasion === o && styles.selectedOption
                ]}
                onPress={() => setOccasion(o)}
              >
                <Calendar size={20} color={occasion === o ? '#FFFFFF' : theme.colors.text} />
                <Text
                  style={[
                    styles.optionText,
                    occasion === o && styles.selectedOptionText
                  ]}
                >
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <Text style={styles.sectionTitle}>Weather</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {weatherOptions.map(w => (
              <Pressable
                key={w}
                style={[
                  styles.optionButton,
                  weather === w && styles.selectedOption
                ]}
                onPress={() => setWeather(w)}
              >
                {getWeatherIcon(w)}
                <Text
                  style={[
                    styles.optionText,
                    weather === w && styles.selectedOptionText
                  ]}
                >
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <Text style={styles.sectionTitle}>Mood</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {moodOptions.map(m => (
              <Pressable
                key={m}
                style={[
                  styles.optionButton,
                  mood === m && styles.selectedOption
                ]}
                onPress={() => setMood(m)}
              >
                <Sparkles size={20} color={mood === m ? '#FFFFFF' : theme.colors.text} />
                <Text
                  style={[
                    styles.optionText,
                    mood === m && styles.selectedOptionText
                  ]}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <Button
            title="Generate Outfit"
            onPress={generateOutfit}
            icon={<Zap size={18} color="#FFFFFF" />}
            style={styles.generateButton}
            loading={isGenerating}
          />
        </View>
        
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Your AI-Generated Outfit</Text>
            <Pressable style={styles.refreshButton} onPress={generateOutfit} disabled={isGenerating}>
              <RefreshCw size={20} color={theme.colors.primary} />
            </Pressable>
          </View>
          
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Creating your perfect outfit...</Text>
            </View>
          ) : suggestedOutfit.length > 0 ? (
            <>
              <View style={styles.outfitGrid}>
                {suggestedOutfit.map(item => (
                  <View key={item.id} style={styles.outfitItem}>
                    <View style={styles.itemImageContainer}>
                      <View style={styles.itemCategoryTag}>
                        <Text style={styles.itemCategoryText}>{item.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.outfitDescription}>
                <Text style={styles.descriptionTitle}>Style Notes</Text>
                <Text style={styles.descriptionText}>
                  This {mood} outfit is perfect for {occasion} occasions in {weather} weather. 
                  The pieces work well together to create a cohesive look that's both stylish and appropriate.
                </Text>
              </View>
              
              <Button
                title="Save This Outfit"
                onPress={handleSaveOutfit}
                style={styles.saveButton}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No outfit generated yet. Click the button above to create one!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },
  optionsContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    margin: theme.spacing.m,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  optionsScroll: {
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.s,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
    gap: theme.spacing.xs,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  generateButton: {
    marginTop: theme.spacing.l,
  },
  resultContainer: {
    margin: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  resultTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 169, 59, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitItem: {
    width: '48%',
    marginBottom: theme.spacing.m,
  },
  itemImageContainer: {
    height: 150,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.xs,
    position: 'relative',
  },
  itemCategoryTag: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  itemCategoryText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    textTransform: 'capitalize',
  },
  itemName: {
    fontSize: theme.fontSize.s,
    fontWeight: '500',
  },
  outfitDescription: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  descriptionTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.text,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: theme.spacing.m,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});