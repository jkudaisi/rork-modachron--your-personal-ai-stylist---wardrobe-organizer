import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, Edit, Trash2, Calendar, Tag, Clock, Camera } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';
import ClothingItem from '@/components/ClothingItem';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getOutfitById, getItemById, toggleFavoriteOutfit, removeOutfit, incrementOutfitWorn, outfitPhotos } = useWardrobeStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const outfit = getOutfitById(id as string);
  
  if (!outfit) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Outfit not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const outfitItems = outfit.items
    .map(itemId => getItemById(itemId))
    .filter(item => item !== undefined);
  
  const handleDelete = () => {
    removeOutfit(outfit.id);
    router.back();
  };
  
  const handleEdit = () => {
    // In a real app, this would navigate to an edit form
    router.push(`/edit-outfit/${outfit.id}`);
  };
  
  const handleWearToday = () => {
    incrementOutfitWorn(outfit.id);
    Alert.alert(
      'Outfit Worn',
      'This outfit has been marked as worn today.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  const handleCapturePhoto = () => {
    router.push('/capture-outfit');
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: outfit.name,
          headerRight: () => (
            <Pressable onPress={handleEdit} style={styles.headerButton}>
              <Edit size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>{outfit.name}</Text>
          <Pressable 
            style={styles.favoriteButton}
            onPress={() => toggleFavoriteOutfit(outfit.id)}
          >
            <Heart 
              size={24} 
              color={outfit.favorite ? theme.colors.secondary : theme.colors.inactive}
              fill={outfit.favorite ? theme.colors.secondary : 'none'}
            />
          </Pressable>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Tag size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{outfit.occasion}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>Worn {outfit.timesWorn} times</Text>
          </View>
          
          {outfit.lastWorn && (
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                Last worn: {new Date(outfit.lastWorn).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
        
        {/* Photos Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Button
              title="Take Photo"
              variant="outline"
              size="small"
              onPress={handleCapturePhoto}
              icon={<Camera size={16} color={theme.colors.primary} />}
            />
          </View>
          
          {outfitPhotos.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            >
              {outfitPhotos.map((photo, index) => (
                <Pressable 
                  key={index}
                  style={[
                    styles.photoThumbnail,
                    selectedPhoto === photo && styles.selectedPhotoThumbnail
                  ]}
                  onPress={() => setSelectedPhoto(photo)}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.thumbnailImage}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noPhotos}>
              <Text style={styles.noPhotosText}>No photos of this outfit yet</Text>
            </View>
          )}
          
          {selectedPhoto && (
            <View style={styles.selectedPhotoContainer}>
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.selectedPhotoImage}
                contentFit="cover"
              />
            </View>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <View style={styles.badgesContainer}>
            {outfit.seasons.map(season => (
              <View key={season} style={styles.badge}>
                <Text style={styles.badgeText}>{season}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Items in this outfit</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsContainer}
          >
            {outfitItems.map(item => (
              item && (
                <ClothingItem
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/item/${item.id}`)}
                  size="medium"
                />
              )
            ))}
          </ScrollView>
        </View>
        
        {outfit.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{outfit.notes}</Text>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <Button
            title="I'm Wearing This Today"
            onPress={handleWearToday}
            style={styles.wearButton}
          />
          
          <Button
            title="Delete Outfit"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    padding: theme.spacing.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  favoriteButton: {
    backgroundColor: theme.colors.border,
    borderRadius: 25,
    padding: 10,
    marginLeft: theme.spacing.m,
  },
  metaContainer: {
    padding: theme.spacing.m,
    paddingTop: 0,
    marginBottom: theme.spacing.m,
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
    paddingHorizontal: theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  sectionTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.s,
  },
  photosContainer: {
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPhotoThumbnail: {
    borderColor: theme.colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  selectedPhotoContainer: {
    marginTop: theme.spacing.m,
    height: 300,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  selectedPhotoImage: {
    width: '100%',
    height: '100%',
  },
  noPhotos: {
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  noPhotosText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
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
  itemsContainer: {
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.m,
  },
  notes: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    lineHeight: 22,
  },
  actionsContainer: {
    padding: theme.spacing.m,
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  wearButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    borderColor: theme.colors.error,
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