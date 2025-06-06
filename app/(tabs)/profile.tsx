import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Settings, Heart, BarChart2, ShoppingBag, Recycle, HelpCircle, LogOut } from 'lucide-react-native';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';

export default function ProfileScreen() {
  const { clothingItems, outfits } = useWardrobeStore();
  
  const totalWears = clothingItems.reduce((sum, item) => sum + item.timesWorn, 0);
  const favoriteItems = clothingItems.filter(item => item.favorite).length;
  
  const menuItems = [
    {
      icon: <BarChart2 size={24} color={theme.colors.text} />,
      title: 'Wardrobe Stats',
      subtitle: 'Track your clothing usage',
    },
    {
      icon: <ShoppingBag size={24} color={theme.colors.text} />,
      title: 'Shopping List',
      subtitle: 'Items you want to buy',
    },
    {
      icon: <Recycle size={24} color={theme.colors.text} />,
      title: 'Sustainability',
      subtitle: 'Your environmental impact',
    },
    {
      icon: <Settings size={24} color={theme.colors.text} />,
      title: 'Settings',
      subtitle: 'App preferences',
    },
    {
      icon: <HelpCircle size={24} color={theme.colors.text} />,
      title: 'Help & Support',
      subtitle: 'FAQs and contact',
    },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>Alex Morgan</Text>
            <Text style={styles.email}>alex.morgan@example.com</Text>
          </View>
        </View>
        <Button
          title="Edit Profile"
          variant="outline"
          size="small"
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{clothingItems.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{outfits.length}</Text>
          <Text style={styles.statLabel}>Outfits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteItems}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalWears}</Text>
          <Text style={styles.statLabel}>Wears</Text>
        </View>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable key={index} style={styles.menuItem}>
            <View style={styles.menuIcon}>{item.icon}</View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      
      <Pressable style={styles.logoutButton}>
        <LogOut size={20} color={theme.colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
      
      <Text style={styles.version}>Modachron v1.0.0</Text>
    </ScrollView>
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
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameContainer: {
    marginLeft: theme.spacing.m,
  },
  name: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.l,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIcon: {
    marginRight: theme.spacing.m,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  menuSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
  },
  logoutText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
    marginLeft: theme.spacing.s,
  },
  version: {
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
});