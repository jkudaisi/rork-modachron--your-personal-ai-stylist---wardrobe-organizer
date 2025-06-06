import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import theme from '@/constants/theme';
import { ClothingCategory } from '@/types/wardrobe';

interface CategoryFilterProps {
  categories: ClothingCategory[];
  selectedCategory: ClothingCategory | null;
  onSelectCategory: (category: ClothingCategory | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={[
          styles.categoryButton,
          selectedCategory === null && styles.selectedButton
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === null && styles.selectedText
          ]}
        >
          All
        </Text>
      </Pressable>
      
      {categories.map((category) => (
        <Pressable
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedButton
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedText
            ]}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
    height: 36, // Fixed height for consistent appearance
    justifyContent: 'center', // Center text vertically
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.s,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});