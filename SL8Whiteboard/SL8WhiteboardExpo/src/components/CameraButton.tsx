import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '../store';
import { addImageElement } from '../store/slices/canvasSlice';
import { useHistory } from '../hooks/useHistory';
import { createImageElement, compressImage, saveImageToLocal } from '../utils/imageUtils';
import { Point } from '../types';

interface CameraButtonProps {
  pastePosition: Point;
  style?: any;
}

const CameraButton: React.FC<CameraButtonProps> = ({ pastePosition, style }) => {
  const dispatch = useAppDispatch();
  const { addToHistory } = useHistory();

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Permission to access camera is required to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Captured photo:', asset);

        try {
          // Process the image
          let imageUri = asset.uri;
          
          // For web, we might need to compress the image
          if (typeof window !== 'undefined') {
            imageUri = await compressImage(asset.uri, 800, 600, 0.8);
          }
          
          // Save to local storage
          const savedUri = await saveImageToLocal(imageUri);
          
          // Create image element
          const imageElement = createImageElement(
            savedUri,
            pastePosition,
            'default-layer'
          );

          // Add to canvas
          dispatch(addImageElement(imageElement));
          addToHistory('ADD_IMAGE', { imageElement });
          
          console.log('Photo added to canvas:', imageElement);
        } catch (error) {
          console.error('Error processing captured photo:', error);
          Alert.alert('Error', 'Failed to process the captured photo.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={takePhoto}>
      <Text style={styles.buttonText}>📷 Camera</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CameraButton;