import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface IngredientChipProps {
  ingredient: string;
  onRemove: () => void;
}

export function IngredientChip({ ingredient, onRemove }: IngredientChipProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{ingredient}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});