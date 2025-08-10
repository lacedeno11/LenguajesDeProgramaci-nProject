import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '../store';
import { addImageElement } from '../store/slices/canvasSlice';
import { useHistory } from '../hooks/useHistory';
import { createImageElement, compressImage, saveImageToLocal } from '../utils/imageUtils';
import { Point } from '../types';

interface ImagePickerButtonProps {
  pastePosition: Point;
  style?: any;
}

const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({ pastePosition, style }) => {
  const dispatch = useAppDispatch();
  const { addToHistory } = useHistory();

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Permission to access camera roll is required to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Selected image:', asset);

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
          
          console.log('Image added to canvas:', imageElement);
        } catch (error) {
          console.error('Error processing selected image:', error);
          Alert.alert('Error', 'Failed to process the selected image.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open image picker.');
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={pickImage}>
      <Text style={styles.buttonText}>📁 Select Image</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#17a2b8',
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

export default ImagePickerButton;