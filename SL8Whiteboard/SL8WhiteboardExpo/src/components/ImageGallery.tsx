import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { imageService, SavedImage } from '../services/ImageService';

interface ImageGalleryProps {
  visible: boolean;
  onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ visible, onClose }) => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadImages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const response = await imageService.getImages();
      
      if (response.success && response.data) {
        setImages(response.data.images);
        console.log('✅ Loaded images:', response.data.images.length);
      } else {
        Alert.alert('Error', response.message || 'No se pudieron cargar las imágenes');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      Alert.alert('Error', 'Error al cargar las imágenes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadImages(false);
  };

  useEffect(() => {
    if (visible) {
      loadImages();
    }
  }, [visible]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🖼️ Galería de Imágenes</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando imágenes...</Text>
          </View>
        ) : images.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📷 No hay imágenes guardadas</Text>
            <Text style={styles.emptySubtext}>
              Guarda tu primera imagen usando el botón "Guardar Imagen" en la pizarra
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {images.map((image) => (
              <View key={image.id} style={styles.imageCard}>
                <Image
                  source={{ uri: imageService.getImageUrl(image.filename) }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                
                <View style={styles.imageInfo}>
                  <Text style={styles.imageTitle} numberOfLines={2}>
                    {image.title}
                  </Text>
                  
                  <Text style={styles.imageDate}>
                    📅 {formatDate(image.created_at)}
                  </Text>
                  
                  <Text style={styles.imageSize}>
                    📊 {formatFileSize(image.size)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📸 Total: {images.length} imagen{images.length !== 1 ? 'es' : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  imageCard: {
    width: (Dimensions.get('window').width - 30) / 2,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageInfo: {
    padding: 10,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  imageDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  imageSize: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});

export default ImageGallery;
