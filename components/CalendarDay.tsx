import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import theme from '@/constants/theme';
import { useWardrobeStore } from '@/store/wardrobe-store';

interface CalendarDayProps {
  date: Date;
  isSelected: boolean;
  hasOutfit: boolean;
  onPress: () => void;
}

export default function CalendarDay({
  date,
  isSelected,
  hasOutfit,
  onPress
}: CalendarDayProps) {
  const { plannedOutfits, getOutfitById, getItemById } = useWardrobeStore();
  
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
  const dayOfMonth = date.getDate();
  const isToday = new Date().setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0);
  
  // Get outfit image if there is a planned outfit for this day
  let outfitImageUri: string | undefined;
  if (hasOutfit) {
    const dateString = date.toISOString().split('T')[0];
    const plannedOutfit = plannedOutfits.find(po => po.date === dateString);
    if (plannedOutfit) {
      const outfit = getOutfitById(plannedOutfit.outfitId);
      if (outfit && outfit.items.length > 0) {
        const firstItem = getItemById(outfit.items[0]);
        outfitImageUri = firstItem?.imageUri;
      }
    }
  }
  
  return (
    <Pressable 
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.dayOfWeek,
        isSelected && styles.selectedText
      ]}>
        {dayOfWeek}
      </Text>
      
      <View style={[
        styles.dateContainer,
        isToday && styles.todayContainer,
        isSelected && styles.selectedDateContainer
      ]}>
        <Text style={[
          styles.date,
          isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {dayOfMonth}
        </Text>
      </View>
      
      {hasOutfit && outfitImageUri && (
        <View style={styles.outfitIndicator}>
          <Image
            source={{ uri: outfitImageUri }}
            style={styles.outfitImage}
            contentFit="cover"
          />
        </View>
      )}
      
      {hasOutfit && !outfitImageUri && (
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.xs,
    width: 50,
  },
  selectedContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
  },
  dayOfWeek: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dateContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  todayContainer: {
    backgroundColor: theme.colors.border,
  },
  selectedDateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  date: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.medium,
  },
  todayText: {
    fontWeight: theme.fontWeight.bold,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  outfitIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
});