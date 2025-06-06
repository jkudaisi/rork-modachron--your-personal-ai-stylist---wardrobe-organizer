import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import CalendarDay from '@/components/CalendarDay';
import OutfitCard from '@/components/OutfitCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function CalendarScreen() {
  const router = useRouter();
  const { plannedOutfits, outfits, getOutfitById } = useWardrobeStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Generate calendar days for the current week
  useEffect(() => {
    const today = new Date();
    const days: Date[] = [];
    
    // Start from 3 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3);
    
    // Generate 14 days
    for (let i = 0; i < 14; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    setCalendarDays(days);
  }, []);
  
  // Format date as YYYY-MM-DD for comparison
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Check if a date has a planned outfit
  const hasOutfitForDate = (date: Date) => {
    const dateString = formatDateString(date);
    return plannedOutfits.some(plan => plan.date === dateString);
  };
  
  // Get planned outfits for selected date
  const getPlannedOutfitsForSelectedDate = () => {
    const dateString = formatDateString(selectedDate);
    const plans = plannedOutfits.filter(plan => plan.date === dateString);
    
    return plans.map(plan => {
      const outfit = getOutfitById(plan.outfitId);
      return {
        ...plan,
        outfit,
      };
    }).filter(plan => plan.outfit);
  };
  
  const plannedOutfitsForDay = getPlannedOutfitsForSelectedDate();
  
  const handleAddOutfit = () => {
    // In a real app, this would navigate to a screen to select an outfit
    router.push('/plan-outfit');
  };
  
  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Pressable 
          style={styles.addButton}
          onPress={handleAddOutfit}
        >
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      </View>
      
      <View style={styles.calendarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScroll}
        >
          {calendarDays.map((day) => (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              isSelected={formatDateString(day) === formatDateString(selectedDate)}
              hasOutfit={hasOutfitForDate(day)}
              onPress={() => setSelectedDate(day)}
            />
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDate}>{formatSelectedDate()}</Text>
      </View>
      
      {plannedOutfitsForDay.length > 0 ? (
        <ScrollView style={styles.outfitsContainer}>
          {plannedOutfitsForDay.map(plan => (
            <View key={plan.id} style={styles.plannedOutfitContainer}>
              {plan.event && (
                <Text style={styles.eventName}>{plan.event}</Text>
              )}
              {plan.outfit && (
                <OutfitCard
                  outfit={plan.outfit}
                  onPress={() => router.push(`/outfit/${plan.outfit.id}`)}
                />
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No outfits planned</Text>
          <Text style={styles.emptyText}>
            Plan what you'll wear on {formatSelectedDate()}
          </Text>
          <Button
            title="Plan Outfit"
            onPress={handleAddOutfit}
            style={styles.planButton}
          />
        </View>
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
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    marginTop: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.m,
  },
  calendarScroll: {
    paddingHorizontal: theme.spacing.m,
  },
  selectedDateContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
  },
  selectedDate: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  outfitsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
  },
  plannedOutfitContainer: {
    marginBottom: theme.spacing.m,
  },
  eventName: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  planButton: {
    minWidth: 150,
  },
});