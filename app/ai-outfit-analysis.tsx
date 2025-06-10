import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, Linking } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Check, X, Sparkles, Tag, Lightbulb, Plus, Search, Trash2, ExternalLink } from 'lucide-react-native';
import { useAIStore } from '@/store/ai-store';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';
import ClothingItem from '@/components/ClothingItem';

export default function AIOutfitAnalysisScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const { analyzeOutfitPhoto, isAnalyzing, removeBackground, findSimilarOutfitsOnline } = useAIStore();
  const { getItemById, addOutfit } = useWardrobeStore();
  
  const [analysis, setAnalysis] = useState<{
    items: string[];
    style: string;
    suggestions: string[];
  } | null>(null);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [similarOutfits, setSimilarOutfits] = useState<any[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [backgroundRemovalError, setBackgroundRemovalError] = useState<string | null>(null);
  
  useEffect(() => {
    if (photoUri) {
      analyzePhoto(decodeURIComponent(photoUri as string));
    }
  }, [photoUri]);
  
  const analyzePhoto = async (uri: string) => {
    try {
      const result = await analyzeOutfitPhoto(uri);
      setAnalysis(result);
      setSelectedItems(result.items);
      
      // Find similar outfits using Google Cloud Vision API-like service
      findSimilarOutfits(uri);
    } catch (error) {
      console.error('Error analyzing photo:', error);
    }
  };
  
  const findSimilarOutfits = async (uri: string) => {
    setIsLoadingSimilar(true);
    try {
      // In a real app, this would call a Google Cloud Vision API
      const results = await findSimilarOutfitsOnline(uri);
      setSimilarOutfits(results);
    } catch (error) {
      console.error('Error finding similar outfits:', error);
      Alert.alert('Error', 'Failed to find similar outfits. Please try again.');
    } finally {
      setIsLoadingSimilar(false);
    }
  };
  
  const handleRemoveBackground = async () => {
    if (!photoUri) return;
    
    setIsProcessingImage(true);
    setBackgroundRemovalError(null);
    
    try {
      const decodedUri = decodeURIComponent(photoUri as string);
      const processedUri = await removeBackground(decodedUri);
      setProcessedImage(processedUri);
    } catch (error) {
      console.error('Error removing background:', error);
      setBackgroundRemovalError('Failed to remove background. The background removal service is currently unavailable.');
    } finally {
      setIsProcessingImage(false);
    }
  };
  
  const handleConfirmOutfit = () => {
    setIsConfirmed(true);
    Alert.alert('Outfit Confirmed', 'Great! This outfit has been confirmed as yours.');
  };
  
  const handleSaveOutfit = () => {
    if (selectedItems.length < 2) {
      return;
    }
    
    addOutfit({
      name: `${analysis?.style || 'My'} Outfit`,
      items: selectedItems,
      occasion: 'casual',
      seasons: ['all'],
      favorite: false,
      notes: '',
    });
    
    router.push('/');
  };
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'AI Outfit Analysis' }} />
      
      <ScrollView style={styles.container}>
        {photoUri && (
          <View style={styles.photoContainer}>
            {processedImage ? (
              <Image
                source={{ uri: processedImage }}
                style={styles.photo}
                contentFit="cover"
              />
            ) : (
              <Image
                source={{ uri: decodeURIComponent(photoUri as string) }}
                style={styles.photo}
                contentFit="cover"
              />
            )}
            
            <View style={styles.photoActions}>
              {!processedImage ? (
                <Button
                  title="Remove Background"
                  variant="outline"
                  size="small"
                  onPress={handleRemoveBackground}
                  loading={isProcessingImage}
                  icon={<Trash2 size={16} color={theme.colors.primary} />}
                />
              ) : (
                <Button
                  title="Use Original"
                  variant="outline"
                  size="small"
                  onPress={() => setProcessedImage(null)}
                />
              )}
              
              {!isConfirmed && (
                <Button
                  title="Confirm This is My Outfit"
                  size="small"
                  onPress={handleConfirmOutfit}
                  icon={<Check size={16} color="#FFFFFF" />}
                />
              )}
            </View>
            
            {backgroundRemovalError && (
              <View style={styles.errorMessage}>
                <Text style={styles.errorText}>{backgroundRemovalError}</Text>
              </View>
            )}
          </View>
        )}
        
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Analyzing your outfit...</Text>
          </View>
        ) : analysis ? (
          <>
            <View style={styles.analysisContainer}>
              <View style={styles.styleContainer}>
                <View style={styles.styleHeader}>
                  <Sparkles size={20} color={theme.colors.primary} />
                  <Text style={styles.styleTitle}>Style Analysis</Text>
                </View>
                <View style={styles.styleContent}>
                  <View style={styles.styleTag}>
                    <Tag size={16} color={theme.colors.text} />
                    <Text style={styles.styleTagText}>{analysis.style}</Text>
                  </View>
                  <Text style={styles.styleDescription}>
                    This outfit has a {analysis.style} vibe. It's versatile and can be styled in multiple ways.
                  </Text>
                </View>
              </View>
              
              {/* Similar Outfits Section - Enhanced with Google Lens-like results */}
              <View style={styles.similarContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Search size={18} color={theme.colors.text} />
                    <Text style={styles.sectionTitle}>Similar Outfits Online</Text>
                  </View>
                </View>
                
                {isLoadingSimilar ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Finding similar outfits...</Text>
                  </View>
                ) : similarOutfits.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.similarScroll}
                  >
                    {similarOutfits.map((outfit) => (
                      <Pressable 
                        key={outfit.id}
                        style={styles.similarOutfitCard}
                        onPress={() => handleOpenLink(outfit.sourceUrl)}
                      >
                        <View style={styles.similarImageContainer}>
                          <Image
                            source={{ uri: outfit.imageUrl }}
                            style={styles.similarImage}
                            contentFit="cover"
                          />
                          <View style={styles.similarScoreContainer}>
                            <Text style={styles.similarScoreText}>{outfit.similarityScore}% match</Text>
                          </View>
                        </View>
                        <View style={styles.similarInfoContainer}>
                          <Text style={styles.similarTitle} numberOfLines={2}>{outfit.title}</Text>
                          <Text style={styles.similarBrand}>{outfit.brand}</Text>
                          <Text style={styles.similarPrice}>{outfit.price}</Text>
                          <View style={styles.similarSourceContainer}>
                            <Text style={styles.similarSourceText}>{outfit.source}</Text>
                            <ExternalLink size={14} color={theme.colors.primary} />
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No similar outfits found</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionsHeader}>
                  <Lightbulb size={20} color={theme.colors.primary} />
                  <Text style={styles.suggestionsTitle}>Style Suggestions</Text>
                </View>
                <View style={styles.suggestionsList}>
                  {analysis.suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionItem}>
                      <View style={styles.suggestionBullet} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.detectedItemsContainer}>
                <Text style={styles.detectedItemsTitle}>Detected Items</Text>
                <Text style={styles.detectedItemsSubtitle}>
                  We've identified these items from your wardrobe. Tap to select or deselect.
                </Text>
                
                <View style={styles.itemsGrid}>
                  {analysis.items.map(itemId => {
                    const item = getItemById(itemId);
                    if (!item) return null;
                    
                    return (
                      <Pressable
                        key={itemId}
                        style={[
                          styles.itemWrapper,
                          selectedItems.includes(itemId) && styles.selectedItemWrapper
                        ]}
                        onPress={() => toggleItemSelection(itemId)}
                      >
                        <ClothingItem
                          item={item}
                          size="small"
                        />
                        {selectedItems.includes(itemId) ? (
                          <View style={styles.selectedItemBadge}>
                            <Check size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View style={styles.unselectedItemBadge}>
                            <X size={12} color={theme.colors.textSecondary} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                  
                  <Pressable
                    style={styles.addItemButton}
                    onPress={() => router.push('/wardrobe')}
                  >
                    <View style={styles.addItemIcon}>
                      <Plus size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.addItemText}>Add More Items</Text>
                  </Pressable>
                </View>
              </View>
              
              <View style={styles.actionsContainer}>
                <Button
                  title="Save as Outfit"
                  onPress={handleSaveOutfit}
                  disabled={selectedItems.length < 2}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              We couldn't analyze this photo. Please try again with a clearer image of your outfit.
            </Text>
            <Button
              title="Go Back"
              onPress={() => router.back()}
              style={styles.errorButton}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  photoContainer: {
    width: '100%',
  },
  photo: {
    width: '100%',
    height: 400,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
    gap: theme.spacing.s,
  },
  errorMessage: {
    marginHorizontal: theme.spacing.m,
    padding: theme.spacing.s,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.s,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },
  analysisContainer: {
    padding: theme.spacing.m,
  },
  styleContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  styleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  styleTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  styleContent: {
    marginTop: theme.spacing.s,
  },
  styleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
  },
  styleTagText: {
    fontSize: theme.fontSize.s,
    marginLeft: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  styleDescription: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    lineHeight: 22,
  },
  similarContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  similarScroll: {
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.m,
  },
  similarOutfitCard: {
    width: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  similarImageContainer: {
    position: 'relative',
    height: 220,
  },
  similarImage: {
    width: '100%',
    height: '100%',
  },
  similarScoreContainer: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.m,
  },
  similarScoreText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  similarInfoContainer: {
    padding: theme.spacing.s,
  },
  similarTitle: {
    fontSize: theme.fontSize.s,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  similarBrand: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  similarPrice: {
    fontSize: theme.fontSize.s,
    fontWeight: '600',
    color: theme.colors.primary,
    marginVertical: 4,
  },
  similarSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  similarSourceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginRight: 4,
  },
  suggestionsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  suggestionsTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  suggestionsList: {
    marginTop: theme.spacing.s,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: theme.spacing.s,
  },
  suggestionText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
  },
  detectedItemsContainer: {
    marginBottom: theme.spacing.m,
  },
  detectedItemsTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  detectedItemsSubtitle: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unselectedItemBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemButton: {
    width: '48%',
    aspectRatio: 3/4,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  addItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(242, 169, 59, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  addItemText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.primary,
  },
  actionsContainer: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorButton: {
    minWidth: 120,
  },
  emptyContainer: {
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
});