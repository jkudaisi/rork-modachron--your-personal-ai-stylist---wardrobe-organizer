import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Calendar } from 'lucide-react-native';
import { Outfit } from '@/types/wardrobe';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';

interface OutfitCardProps {
  outfit: Outfit;
  onPress?: () => void;
}

export default function OutfitCard({ outfit, onPress }: OutfitCardProps) {
  const { getItemById, toggleFavoriteOutfit } = useWardrobeStore();
  
  // Get the first item's image to represent the outfit
  const firstItemId = outfit.items[0];
  const firstItem = firstItemId ? getItemById(firstItemId) : undefined;
  const imageUri = firstItem?.imageUri || 'https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavoriteOutfit(outfit.id);
  };
  
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.overlay}>
          <Text style={styles.itemCount}>{outfit.items.length} items</Text>
        </View>
        <Pressable 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
        >
          <Heart 
            size={22} 
            color={outfit.favorite ? theme.colors.secondary : theme.colors.inactive}
            fill={outfit.favorite ? theme.colors.secondary : 'none'}
          />
        </Pressable>
      </View>
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{outfit.name}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.occasion}>{outfit.occasion}</Text>
          {outfit.lastWorn && (
            <View style={styles.lastWorn}>
              <Calendar size={12} color={theme.colors.textSecondary} />
              <Text style={styles.lastWornText}>
                {new Date(outfit.lastWorn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginBottom: theme.spacing.m,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: theme.spacing.xs,
  },
  itemCount: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 6,
  },
  details: {
    marginTop: theme.spacing.xs,
  },
  name: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occasion: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  lastWorn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastWornText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});