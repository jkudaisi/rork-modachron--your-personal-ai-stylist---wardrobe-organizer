import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { ExternalLink } from 'lucide-react-native';
import theme from '@/constants/theme';

interface SimilarOutfitProps {
  outfit: {
    imageUrl: string;
    title: string;
    source: string;
    sourceUrl: string;
    similarityScore: number;
  };
}

export default function SimilarOutfitCard({ outfit }: SimilarOutfitProps) {
  const handleOpenLink = () => {
    if (outfit.sourceUrl) {
      Linking.openURL(outfit.sourceUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: outfit.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{outfit.similarityScore}% match</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{outfit.title}</Text>
        <Pressable style={styles.sourceButton} onPress={handleOpenLink}>
          <Text style={styles.sourceText}>{outfit.source}</Text>
          <ExternalLink size={14} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.m,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  infoContainer: {
    padding: theme.spacing.s,
  },
  title: {
    fontSize: theme.fontSize.s,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginRight: 4,
  },
});