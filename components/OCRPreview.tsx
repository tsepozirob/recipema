import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface OCRPreviewProps {
  visible: boolean;
  imageUri: string | null;
  onConfirm: (ingredients: string[]) => void;
  onCancel: () => void;
}

export function OCRPreview({ visible, imageUri, onConfirm, onCancel }: OCRPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [extractedText, setExtractedText] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    if (visible && imageUri) {
      processImage();
    }
  }, [visible, imageUri]);

  const processImage = async () => {
    setLoading(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockText = `Fresh tomatoes
2 onions
Garlic cloves
Olive oil
Salt and pepper
Basil leaves`;
      
      const mockIngredients = [
        'Fresh tomatoes',
        'Onions',
        'Garlic cloves',
        'Olive oil',
        'Salt',
        'Pepper',
        'Basil leaves',
      ];

      setExtractedText(mockText);
      setIngredients(mockIngredients);
      setLoading(false);
    }, 2000);
  };

  const handleConfirm = () => {
    onConfirm(ingredients);
    setExtractedText('');
    setIngredients([]);
  };

  const handleCancel = () => {
    onCancel();
    setExtractedText('');
    setIngredients([]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>OCR Preview</Text>
          
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.image} />
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Extracting ingredients...</Text>
            </View>
          ) : (
            <ScrollView style={styles.resultsContainer}>
              <Text style={styles.subtitle}>Detected Ingredients:</Text>
              <View style={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientText}>• {ingredient}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subtitle}>Raw Text:</Text>
              <Text style={styles.rawText}>{extractedText}</Text>
            </ScrollView>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            {!loading && (
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Add Ingredients</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
  resultsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 16,
  },
  ingredientsList: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  ingredientItem: {
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  rawText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    backgroundColor: Colors.light.surface,
    padding: 12,
    borderRadius: 8,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});