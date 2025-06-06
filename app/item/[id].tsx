import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, Edit, Trash2, Calendar, Tag, Clock } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getItemById, toggleFavoriteItem, removeClothingItem } = useWardrobeStore();
  
  const item = getItemById(id as string);
  
  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Item not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const handleDelete = () => {
    removeClothingItem(item.id);
    router.back();
  };
  
  const handleEdit = () => {
    // In a real app, this would navigate to an edit form
    router.push(`/edit-item/${item.id}`);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: item.name,
          headerRight: () => (
            <Pressable onPress={handleEdit} style={styles.headerButton}>
              <Edit size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            contentFit="cover"
          />
          <Pressable 
            style={styles.favoriteButton}
            onPress={() => toggleFavoriteItem(item.id)}
          >
            <Heart 
              size={24} 
              color={item.favorite ? theme.colors.secondary : theme.colors.inactive}
              fill={item.favorite ? theme.colors.secondary : 'none'}
            />
          </Pressable>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{item.name}</Text>
          
          {item.brand && (
            <Text style={styles.brand}>{item.brand}</Text>
          )}
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Tag size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>Worn {item.timesWorn} times</Text>
            </View>
            
            {item.lastWorn && (
              <View style={styles.metaItem}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  Last worn: {new Date(item.lastWorn).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <View style={styles.colorsContainer}>
              {item.colors.map(color => (
                <View 
                  key={color} 
                  style={[styles.colorBadge, { backgroundColor: getColorHex(color) }]}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <View style={styles.badgesContainer}>
              {item.seasons.map(season => (
                <View key={season} style={styles.badge}>
                  <Text style={styles.badgeText}>{season}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Occasions</Text>
            <View style={styles.badgesContainer}>
              {item.occasions.map(occasion => (
                <View key={occasion} style={styles.badge}>
                  <Text style={styles.badgeText}>{occasion}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {item.notes && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{item.notes}</Text>
            </View>
          )}
          
          <Button
            title="Delete Item"
            onPress={handleDelete}
            variant="outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
            icon={<Trash2 size={18} color={theme.colors.error} />}
          />
        </View>
      </ScrollView>
    </>
  );
}

// Helper function to convert color names to hex
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    beige: '#F5F5DC',
    brown: '#A52A2A',
    navy: '#000080',
    blue: '#0000FF',
    green: '#008000',
    red: '#FF0000',
    pink: '#FFC0CB',
    purple: '#800080',
    yellow: '#FFFF00',
    orange: '#FFA500',
    multicolor: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)'
  };
  
  return colorMap[color] || '#CCCCCC';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    padding: theme.spacing.s,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: theme.spacing.m,
    right: theme.spacing.m,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    padding: 10,
  },
  detailsContainer: {
    padding: theme.spacing.m,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  brand: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  metaContainer: {
    marginBottom: theme.spacing.l,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  sectionContainer: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.s,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  colorBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  badge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    lineHeight: 22,
  },
  deleteButton: {
    borderColor: theme.colors.error,
    marginTop: theme.spacing.m,
  },
  deleteButtonText: {
    color: theme.colors.error,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  notFoundText: {
    fontSize: theme.fontSize.l,
    marginBottom: theme.spacing.m,
  },
  backButton: {
    minWidth: 120,
  },
});