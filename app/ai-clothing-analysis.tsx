import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, TextInput } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Tag, Sparkles, Lightbulb, Palette, Shirt, Check } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { analyzeClothingImage, findSimilarItems } from '@/services/hugging-face-service';
import theme from '@/constants/theme';
import Button from '@/components/Button';
import ClothingItem from '@/components/ClothingItem';
import { ClothingCategory, ClothingColor } from '@/types/wardrobe';

export default function AIClothingAnalysisScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const { clothingItems, addClothingItem } = useWardrobeStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    category?: string;
    colors?: string[];
    style?: string;
  } | null>(null);
  const [similarItems, setSimilarItems] = useState<{ id: string; score: number }[]>([]);
  
  // Form state for adding a new item
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [selectedColors, setSelectedColors] = useState<ClothingColor[]>([]);
  
  useEffect(() => {
    if (photoUri) {
      analyzeClothing(decodeURIComponent(photoUri as string));
    }
  }, [photoUri]);
  
  const analyzeClothing = async (uri: string) => {
    setIsAnalyzing(true);
    
    try {
      // Analyze clothing image
      const result = await analyzeClothingImage(uri);
      
      setCaption(result.caption);
      setAnalysis({
        category: result.category,
        colors: result.colors,
        style: result.style
      });
      
      // Set form defaults based on analysis
      if (result.category) {
        setSelectedCategory(result.category as ClothingCategory);
      }
      
      if (result.colors && result.colors.length > 0) {
        setSelectedColors(result.colors.map(color => color as ClothingColor));
      }
      
      // Generate a name based on the caption
      const words = result.caption.split(' ');
      if (words.length > 3) {
        // Use first few words as the name
        setItemName(words.slice(0, 3).join(' '));
      } else {
        setItemName(result.caption);
      }
      
      // Find similar items
      if (result.category) {
        const itemsInSameCategory = clothingItems.filter(
          item => item.category === result.category
        );
        
        if (itemsInSameCategory.length > 0) {
          const similar = await findSimilarItems(
            uri,
            itemsInSameCategory.map(item => ({ id: item.id, imageUri: item.imageUri })),
            result.category
          );
          
          setSimilarItems(similar);
        }
      }
    } catch (error) {
      console.error('Error analyzing clothing:', error);
      Alert.alert('Error', 'Failed to analyze clothing. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAddItem = () => {
    if (!photoUri || !selectedCategory) {
      Alert.alert('Error', 'Please select a category for this item');
      return;
    }
    
    const decodedUri = decodeURIComponent(photoUri as string);
    
    addClothingItem({
      name: itemName || 'New Item',
      category: selectedCategory,
      imageUri: decodedUri,
      colors: selectedColors,
      seasons: ['all'],
      occasions: ['casual'],
      favorite: false,
      brand: '',
      notes: caption || '',
    });
    
    Alert.alert(
      'Success',
      'Item added to your wardrobe!',
      [{ text: 'OK', onPress: () => router.push('/wardrobe') }]
    );
  };
  
  const toggleColor = (color: ClothingColor) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };
  
  const renderSimilarItems = () => {
    if (similarItems.length === 0) return null;
    
    // Get top 5 similar items
    const topSimilar = similarItems.slice(0, 5);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Sparkles size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Similar Items in Your Wardrobe</Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.similarItemsContainer}
        >
          {topSimilar.map(({ id, score }) => {
            const item = clothingItems.find(item => item.id === id);
            if (!item) return null;
            
            return (
              <View key={id} style={styles.similarItemWrapper}>
                <ClothingItem
                  item={item}
                  onPress={() => router.push(`/item/${item.id}`)}
                  size="small"
                />
                <View style={styles.similarityScore}>
                  <Text style={styles.similarityScoreText}>
                    {Math.round(score * 100)}% match
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'AI Clothing Analysis',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        {photoUri && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: decodeURIComponent(photoUri as string) }}
              style={styles.photo}
              contentFit="cover"
            />
          </View>
        )}
        
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Analyzing your clothing item...</Text>
          </View>
        ) : caption ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Lightbulb size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>AI Description</Text>
              </View>
              <Text style={styles.caption}>{caption}</Text>
            </View>
            
            {analysis && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Tag size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Detected Attributes</Text>
                </View>
                
                <View style={styles.attributesContainer}>
                  {analysis.category && (
                    <View style={styles.attribute}>
                      <Shirt size={16} color={theme.colors.text} />
                      <Text style={styles.attributeText}>
                        Category: {analysis.category}
                      </Text>
                    </View>
                  )}
                  
                  {analysis.colors && analysis.colors.length > 0 && (
                    <View style={styles.attribute}>
                      <Palette size={16} color={theme.colors.text} />
                      <Text style={styles.attributeText}>
                        Colors: {analysis.colors.join(', ')}
                      </Text>
                    </View>
                  )}
                  
                  {analysis.style && (
                    <View style={styles.attribute}>
                      <Sparkles size={16} color={theme.colors.text} />
                      <Text style={styles.attributeText}>
                        Style: {analysis.style}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {renderSimilarItems()}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add to Your Wardrobe</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="Enter item name"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoriesContainer}>
                  {['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories'].map((category) => (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.selectedCategoryButton
                      ]}
                      onPress={() => setSelectedCategory(category as ClothingCategory)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.selectedCategoryButtonText
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Colors</Text>
                <View style={styles.colorsContainer}>
                  {['black', 'white', 'gray', 'beige', 'brown', 'navy', 'blue', 'green', 'red', 'pink', 'purple', 'yellow', 'orange', 'multicolor'].map((color) => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: getColorHex(color) },
                        selectedColors.includes(color as ClothingColor) && styles.selectedColorButton
                      ]}
                      onPress={() => toggleColor(color as ClothingColor)}
                    >
                      {selectedColors.includes(color as ClothingColor) && (
                        <View style={styles.colorCheckmark}>
                          <Check size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
              
              <Button
                title="Add to Wardrobe"
                onPress={handleAddItem}
                style={styles.addButton}
                disabled={!selectedCategory}
              />
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              We couldn't analyze this photo. Please try again with a clearer image of your clothing item.
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
  photoContainer: {
    width: '100%',
    height: 400,
  },
  photo: {
    width: '100%',
    height: '100%',
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
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    margin: theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  sectionTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
  },
  caption: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    lineHeight: 24,
  },
  attributesContainer: {
    marginTop: theme.spacing.s,
  },
  attribute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  attributeText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    marginLeft: theme.spacing.s,
    textTransform: 'capitalize',
  },
  similarItemsContainer: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.m,
  },
  similarItemWrapper: {
    position: 'relative',
  },
  similarityScore: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  similarityScoreText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.fontSize.m,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    padding: theme.spacing.m,
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.m,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  colorCheckmark: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: theme.spacing.m,
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  errorButton: {
    minWidth: 120,
  },
});