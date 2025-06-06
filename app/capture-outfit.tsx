import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Camera, X, RotateCcw, Check, Shirt } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobeStore } from '@/store/wardrobe-store';
import Button from '@/components/Button';
import theme from '@/constants/theme';

export default function CaptureOutfitScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<any>(null);
  const { addOutfitPhoto } = useWardrobeStore();

  // Request camera permission if not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture your outfits. This helps you build your digital wardrobe.
        </Text>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    
    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const resetPhoto = () => {
    setPhoto(null);
  };

  const savePhoto = async () => {
    if (!photo) return;
    
    try {
      await addOutfitPhoto(photo);
      Alert.alert(
        'Photo Saved',
        'Your photo has been saved. What would you like to do next?',
        [
          {
            text: 'Just Save',
            style: 'cancel',
            onPress: () => router.back(),
          },
          {
            text: 'Create Outfit',
            onPress: () => router.push('/create-outfit'),
          },
          {
            text: 'Analyze Outfit',
            onPress: () => router.push({
              pathname: '/ai-outfit-analysis',
              params: { photoUri: encodeURIComponent(photo) }
            }),
          },
          {
            text: 'Analyze Single Item',
            onPress: () => router.push({
              pathname: '/ai-clothing-analysis',
              params: { photoUri: encodeURIComponent(photo) }
            }),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Capture Photo',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {!photo ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraGuide}>
                  <View style={styles.cameraGuideFrame} />
                  <Text style={styles.cameraGuideText}>Position your outfit or item in the frame</Text>
                </View>
                <View style={styles.cameraControls}>
                  <Pressable style={styles.cameraButton} onPress={pickImage}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                      style={styles.galleryButtonImage}
                      contentFit="cover"
                    />
                  </Pressable>
                  
                  <Pressable 
                    style={styles.captureButton} 
                    onPress={takePhoto}
                    disabled={isTakingPhoto}
                  >
                    {isTakingPhoto ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Camera size={32} color="#FFFFFF" />
                    )}
                  </Pressable>
                  
                  <Pressable style={styles.cameraButton} onPress={toggleCameraFacing}>
                    <RotateCcw size={24} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </CameraView>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>Capture Photo</Text>
              <Text style={styles.instructionsText}>
                Take a photo in good lighting. You can analyze a full outfit or a single clothing item with our AI.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: photo }}
              style={styles.previewImage}
              contentFit="cover"
            />
            
            <View style={styles.previewControls}>
              <Button
                title="Retake"
                variant="outline"
                onPress={resetPhoto}
                icon={<RotateCcw size={18} color={theme.colors.primary} />}
                style={styles.previewButton}
              />
              
              <Button
                title="Use This Photo"
                onPress={savePhoto}
                icon={<Check size={18} color="#FFFFFF" />}
                style={styles.previewButton}
              />
            </View>
          </View>
        )}
      </View>
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
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  permissionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
  },
  cameraGuideFrame: {
    width: '100%',
    height: '80%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  cameraGuideText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.s,
    fontWeight: '500',
    marginTop: theme.spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  galleryButtonImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
  instructions: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  instructionsText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});