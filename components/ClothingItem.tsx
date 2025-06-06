import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { ClothingItem as ClothingItemType } from '@/types/wardrobe';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';

interface ClothingItemProps {
  item: ClothingItemType;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function ClothingItem({ item, onPress, size = 'medium' }: ClothingItemProps) {
  const toggleFavorite = useWardrobeStore(state => state.toggleFavoriteItem);
  
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };
  
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 100, height: 120 };
      case 'large':
        return { width: 180, height: 220 };
      case 'medium':
      default:
        return { width: 140, height: 170 };
    }
  };
  
  const dimensions = getDimensions();
  
  return (
    <Pressable 
      style={[styles.container, { width: dimensions.width }]} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.image, { height: dimensions.height }]}
          contentFit="cover"
          transition={200}
        />
        <Pressable 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
        >
          <Heart 
            size={22} 
            color={item.favorite ? theme.colors.secondary : theme.colors.inactive}
            fill={item.favorite ? theme.colors.secondary : 'none'}
          />
        </Pressable>
      </View>
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    backgroundColor: theme.colors.border,
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
  category: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
});