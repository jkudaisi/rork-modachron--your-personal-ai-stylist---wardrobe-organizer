import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Check } from 'lucide-react-native';
import { ClothingItem } from '@/types/wardrobe';
import Button from './Button';
import theme from '@/constants/theme';
import { useWardrobeStore } from '@/store/wardrobe-store';

interface OutfitSuggestionProps {
  items: ClothingItem[];
  onSaveOutfit?: () => void;
  onRegenerateOutfit?: () => void;
  isLoading?: boolean;
}

export default function OutfitSuggestion({
  items,
  onSaveOutfit,
  onRegenerateOutfit,
  isLoading = false
}: OutfitSuggestionProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>(
    items.map(item => item.id)
  );
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const handleSaveOutfit = () => {
    if (onSaveOutfit) {
      onSaveOutfit();
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outfit Suggestion</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating your outfit...</Text>
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsContainer}
          >
            {items.map(item => (
              <Pressable 
                key={item.id}
                style={styles.itemWrapper}
                onPress={() => toggleItemSelection(item.id)}
              >
                <View style={[
                  styles.itemContainer,
                  selectedItems.includes(item.id) && styles.selectedItem
                ]}>
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                  {selectedItems.includes(item.id) && (
                    <View style={styles.checkmark}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Regenerate"
              variant="outline"
              onPress={onRegenerateOutfit}
              style={styles.regenerateButton}
            />
            <Button
              title="Save Outfit"
              onPress={handleSaveOutfit}
              disabled={selectedItems.length < 2}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.m,
  },
  itemsContainer: {
    paddingBottom: theme.spacing.m,
    gap: theme.spacing.m,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 100,
  },
  itemContainer: {
    width: 80,
    height: 100,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: theme.colors.primary,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  itemCategory: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  regenerateButton: {
    marginRight: theme.spacing.m,
  },
  loadingContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },
});