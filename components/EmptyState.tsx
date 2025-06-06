import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Button from './Button';
import theme from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  image?: string;
}

export default function EmptyState({
  title,
  message,
  buttonTitle,
  onButtonPress,
  image = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoShape}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.logoTitle}>ModaChron</Text>
      </View>
      <Image
        source={{ uri: image }}
        style={styles.image}
        contentFit="cover"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoShape: {
    width: 80,
    height: 60,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.primary,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  logoTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: theme.spacing.l,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  button: {
    minWidth: 150,
  }
});