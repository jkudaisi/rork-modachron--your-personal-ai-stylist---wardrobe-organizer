import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Plus, Search, Filter, Camera, Shirt, ArrowLeft } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import ClothingItem from '@/components/ClothingItem';
import CategoryFilter from '@/components/CategoryFilter';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import { ClothingCategory } from '@/types/wardrobe';

export default function WardrobeScreen() {
  const router = useRouter();
  const { clothingItems, outfitPhotos } = useWardrobeStore();
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [showingPhotos, setShowingPhotos] = useState(false);
  
  const categories: ClothingCategory[] = [
    'tops',
    'bottoms',
    'outerwear',
    'dresses',
    'shoes',
    'accessories'
  ];
  
  const filteredItems = selectedCategory
    ? clothingItems.filter(item => item.category === selectedCategory)
    : clothingItems;
  
  const handleAddItem = () => {
    // In a real app, this would navigate to an add item form
    router.push('/add-item');
  };
  
  const handleCaptureOutfit = () => {
    router.push('/capture-outfit');
  };
  
  const toggleView = () => {
    setShowingPhotos(!showingPhotos);
  };
  
  if (clothingItems.length === 0 && outfitPhotos.length === 0) {
    return (
      <EmptyState
        title="Your Wardrobe is Empty"
        message="Start adding your clothing items to build your digital wardrobe."
        buttonTitle="Add First Item"
        onButtonPress={handleAddItem}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>My Wardrobe</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={toggleView}>
            {showingPhotos ? (
              <Shirt size={24} color={theme.colors.text} />
            ) : (
              <Camera size={24} color={theme.colors.text} />
            )}
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Search size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Filter size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable 
            style={[styles.iconButton, styles.addButton]}
            onPress={showingPhotos ? handleCaptureOutfit : handleAddItem}
          >
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      
      {showingPhotos ? (
        // Outfit Photos View
        <View style={styles.photosContainer}>
          <Text style={styles.sectionTitle}>Outfit Photos</Text>
          
          {outfitPhotos.length > 0 ? (
            <FlatList
              data={outfitPhotos}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.photoItem}
                  onPress={() => router.push({
                    pathname: '/ai-outfit-analysis',
                    params: { photoUri: encodeURIComponent(item) }
                  })}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.photo}
                    contentFit="cover"
                  />
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoOverlayText}>Analyze with AI</Text>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              contentContainerStyle={styles.photosGrid}
              columnWrapperStyle={styles.columnWrapper}
            />
          ) : (
            <View style={styles.emptyPhotos}>
              <Text style={styles.emptyText}>No outfit photos yet</Text>
              <Button
                title="Capture Outfit"
                onPress={handleCaptureOutfit}
                icon={<Camera size={18} color="#FFFFFF" />}
                style={styles.captureButton}
              />
            </View>
          )}
        </View>
      ) : (
        // Clothing Items View
        <>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
              <ClothingItem
                item={item}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
          />
        </>
      )}
    </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.m,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  photosContainer: {
    flex: 1,
    padding: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '700',
    marginBottom: theme.spacing.m,
  },
  photosGrid: {
    paddingBottom: theme.spacing.xl,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 3/4,
    marginBottom: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.xs,
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyPhotos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
  },
  captureButton: {
    minWidth: 180,
  },
});