import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useWardrobeStore } from '@/store/wardrobe-store';
import Button from '@/components/Button';
import ClothingItem from '@/components/ClothingItem';
import CategoryFilter from '@/components/CategoryFilter';
import theme from '@/constants/theme';
import { ClothingCategory, Occasion, Season } from '@/types/wardrobe';

export default function CreateOutfitScreen() {
  const router = useRouter();
  const { clothingItems, addOutfit, outfitPhotos } = useWardrobeStore();
  const [name, setName] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [seasons, setSeasons] = useState<Season[]>(['all']);
  
  const categories: ClothingCategory[] = [
    'tops',
    'bottoms',
    'outerwear',
    'dresses',
    'shoes',
    'accessories'
  ];
  
  const occasions: Occasion[] = [
    'casual',
    'work',
    'formal',
    'athletic',
    'special'
  ];
  
  const allSeasons: Season[] = [
    'spring',
    'summer',
    'fall',
    'winter',
    'all'
  ];
  
  const filteredItems = selectedCategory
    ? clothingItems.filter(item => item.category === selectedCategory)
    : clothingItems;
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const toggleSeason = (season: Season) => {
    setSeasons(prev => {
      if (season === 'all') {
        return ['all'];
      }
      
      const withoutAll = prev.filter(s => s !== 'all');
      
      if (prev.includes(season)) {
        return withoutAll.filter(s => s !== season).length ? withoutAll.filter(s => s !== season) : ['all'];
      } else {
        return [...withoutAll, season];
      }
    });
  };
  
  const handleCreateOutfit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an outfit name');
      return;
    }
    
    if (selectedItems.length < 2) {
      Alert.alert('Error', 'Please select at least 2 items for your outfit');
      return;
    }
    
    addOutfit({
      name,
      items: selectedItems,
      occasion,
      seasons,
      favorite: false,
      notes: '',
    });
    
    Alert.alert(
      'Success',
      'Your outfit has been created!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  // Get the latest outfit photo if available
  const latestPhoto = outfitPhotos && outfitPhotos.length > 0 
    ? outfitPhotos[outfitPhotos.length - 1] 
    : null;
  
  return (
    <>
      <Stack.Screen options={{ title: 'Create New Outfit' }} />
      
      <ScrollView style={styles.container}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Outfit Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter outfit name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        
        {latestPhoto && (
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Outfit Photo</Text>
            <Image
              source={{ uri: latestPhoto }}
              style={styles.outfitPhoto}
              contentFit="cover"
            />
          </View>
        )}
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Occasion</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.occasionsContainer}
          >
            {occasions.map(o => (
              <Pressable
                key={o}
                style={[
                  styles.occasionButton,
                  occasion === o && styles.selectedOccasion
                ]}
                onPress={() => setOccasion(o)}
              >
                <Text
                  style={[
                    styles.occasionText,
                    occasion === o && styles.selectedOccasionText
                  ]}
                >
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seasonsContainer}
          >
            {allSeasons.map(s => (
              <Pressable
                key={s}
                style={[
                  styles.seasonButton,
                  seasons.includes(s) && styles.selectedSeason
                ]}
                onPress={() => toggleSeason(s)}
              >
                <Text
                  style={[
                    styles.seasonText,
                    seasons.includes(s) && styles.selectedSeasonText
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Select Items</Text>
          <Text style={styles.itemsSelected}>
            {selectedItems.length} items selected
          </Text>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <View style={styles.itemsGrid}>
            {filteredItems.map(item => (
              <Pressable
                key={item.id}
                style={[
                  styles.itemWrapper,
                  selectedItems.includes(item.id) && styles.selectedItemWrapper
                ]}
                onPress={() => toggleItemSelection(item.id)}
              >
                <ClothingItem
                  item={item}
                  size="small"
                />
                {selectedItems.includes(item.id) && (
                  <View style={styles.selectedItemBadge} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Create Outfit"
            onPress={handleCreateOutfit}
            disabled={selectedItems.length < 2 || !name.trim()}
          />
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
  formSection: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.m,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.fontSize.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photoSection: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  outfitPhoto: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.m,
  },
  occasionsContainer: {
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  occasionButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  selectedOccasion: {
    backgroundColor: theme.colors.primary,
  },
  occasionText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
  selectedOccasionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  seasonsContainer: {
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  seasonButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  selectedSeason: {
    backgroundColor: theme.colors.primary,
  },
  seasonText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
  selectedSeasonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  itemsSection: {
    padding: theme.spacing.m,
  },
  itemsSelected: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  itemWrapper: {
    width: '48%',
    marginBottom: theme.spacing.m,
    position: 'relative',
    borderRadius: theme.borderRadius.m,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItemWrapper: {
    borderColor: theme.colors.primary,
  },
  selectedItemBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonContainer: {
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
});