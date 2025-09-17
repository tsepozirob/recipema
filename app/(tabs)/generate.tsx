import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useRecipeGeneration } from '@/hooks/useRecipeGeneration';
import { useSubscription } from '@/hooks/useSubscription';
import { IngredientChip } from '@/components/IngredientChip';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { OCRPreview } from '@/components/OCRPreview';
import { Colors } from '@/constants/Colors';

export default function GenerateScreen() {
  const params = useLocalSearchParams();
  const { generateRecipe, loading } = useRecipeGeneration();
  const { isPremium, showPaywall } = useSubscription();
  
  const [mode, setMode] = useState<'text' | 'camera' | 'voice'>('text');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientText, setIngredientText] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showOCRPreview, setShowOCRPreview] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  
  // Dietary filters
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState('30');
  const [servings, setServings] = useState('4');

  useEffect(() => {
    if (params.mode) {
      setMode(params.mode as any);
      if (params.mode === 'camera') {
        handleCameraCapture();
      } else if (params.mode === 'voice') {
        setShowVoiceRecorder(true);
      }
    }
  }, [params.mode]);

  const handleAddIngredient = () => {
    if (ingredientText.trim()) {
      setIngredients([...ingredients, ingredientText.trim()]);
      setIngredientText('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleCameraCapture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setOcrImage(result.assets[0].uri);
      setShowOCRPreview(true);
    }
  };

  const handleOCRConfirm = (extractedIngredients: string[]) => {
    setIngredients([...ingredients, ...extractedIngredients]);
    setShowOCRPreview(false);
    setOcrImage(null);
  };

  const handleVoiceComplete = (spokenText: string) => {
    // Parse spoken ingredients
    const spokenIngredients = spokenText
      .split(/,|and|\n/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setIngredients([...ingredients, ...spokenIngredients]);
    setShowVoiceRecorder(false);
  };

  const toggleDietaryFilter = (filter: string) => {
    if (dietaryFilters.includes(filter)) {
      setDietaryFilters(dietaryFilters.filter(f => f !== filter));
    } else {
      setDietaryFilters([...dietaryFilters, filter]);
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient');
      return;
    }

    if (!isPremium && ingredients.length > 3) {
      showPaywall();
      return;
    }

    try {
      const recipe = await generateRecipe({
        ingredients,
        constraints: dietaryFilters,
        time_minutes: parseInt(cookingTime),
        servings: parseInt(servings),
      });

      if (recipe) {
        router.push({
          pathname: '/recipe/[id]',
          params: { id: recipe.id, data: JSON.stringify(recipe) },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    }
  };

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Low-Carb', 'Keto', 'Paleo', 'Nut-Free'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.light.surface, Colors.light.background]} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Generate Recipe</Text>
            <Text style={styles.subtitle}>Tell me what ingredients you have</Text>
          </View>

          {/* Input Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'text' && styles.modeButtonActive]}
              onPress={() => setMode('text')}
            >
              <Text style={[styles.modeButtonText, mode === 'text' && styles.modeButtonTextActive]}>
                Text
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, mode === 'camera' && styles.modeButtonActive]}
              onPress={() => {
                setMode('camera');
                handleCameraCapture();
              }}
            >
              <Text style={[styles.modeButtonText, mode === 'camera' && styles.modeButtonTextActive]}>
                Camera
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, mode === 'voice' && styles.modeButtonActive]}
              onPress={() => {
                setMode('voice');
                setShowVoiceRecorder(true);
              }}
            >
              <Text style={[styles.modeButtonText, mode === 'voice' && styles.modeButtonTextActive]}>
                Voice
              </Text>
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          {mode === 'text' && (
            <View style={styles.inputSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add an ingredient..."
                  value={ingredientText}
                  onChangeText={setIngredientText}
                  onSubmitEditing={handleAddIngredient}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ingredients List */}
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredients ({ingredients.length})</Text>
            <View style={styles.ingredientsList}>
              {ingredients.map((ingredient, index) => (
                <IngredientChip
                  key={index}
                  ingredient={ingredient}
                  onRemove={() => handleRemoveIngredient(index)}
                />
              ))}
              {ingredients.length === 0 && (
                <Text style={styles.emptyText}>No ingredients added yet</Text>
              )}
            </View>
          </View>

          {/* Dietary Filters */}
          <View style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>Dietary Preferences</Text>
            <View style={styles.filtersList}>
              {dietaryOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    dietaryFilters.includes(filter) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleDietaryFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      dietaryFilters.includes(filter) && styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipe Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Cooking Time</Text>
              <View style={styles.timeButtons}>
                {['15', '30', '45', '60'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      cookingTime === time && styles.timeButtonActive,
                    ]}
                    onPress={() => setCookingTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        cookingTime === time && styles.timeButtonTextActive,
                      ]}
                    >
                      {time}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Servings</Text>
              <View style={styles.timeButtons}>
                {['2', '4', '6', '8'].map((serving) => (
                  <TouchableOpacity
                    key={serving}
                    style={[
                      styles.timeButton,
                      servings === serving && styles.timeButtonActive,
                    ]}
                    onPress={() => setServings(serving)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        servings === serving && styles.timeButtonTextActive,
                      ]}
                    >
                      {serving}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, (loading || ingredients.length === 0) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading || ingredients.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Recipe</Text>
            )}
          </TouchableOpacity>

          {!isPremium && (
            <View style={styles.premiumHint}>
              <Text style={styles.premiumHintText}>
                Premium users can add unlimited ingredients and use advanced features
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Voice Recorder Modal */}
      <VoiceRecorder
        visible={showVoiceRecorder}
        onComplete={handleVoiceComplete}
        onCancel={() => setShowVoiceRecorder(false)}
      />

      {/* OCR Preview Modal */}
      <OCRPreview
        visible={showOCRPreview}
        imageUri={ocrImage}
        onConfirm={handleOCRConfirm}
        onCancel={() => {
          setShowOCRPreview(false);
          setOcrImage(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  modeButtonTextActive: {
    color: 'white',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addButton: {
    marginLeft: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ingredientsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: 'white',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  settingRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  timeButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  timeButtonTextActive: {
    color: 'white',
  },
  generateButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.light.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  premiumHint: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: Colors.light.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.warning + '30',
  },
  premiumHintText: {
    fontSize: 12,
    color: Colors.light.warning,
    textAlign: 'center',
  },
});