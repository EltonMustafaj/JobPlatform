import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, FontWeight } from '@/constants/Theme';

interface Props {
  resetError?: () => void;
}

export default function ErrorBoundaryFallback({ resetError }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diçka shkoi keq</Text>
      <Text style={styles.subtitle}>Provo përsëri ose rifillo aplikacionin.</Text>
      {resetError && (
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Rifillo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    color: Colors.neutral?.[900] || '#111',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.neutral?.[600] || '#555',
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary?.[500] || '#0ea5e9',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    color: '#fff',
    fontWeight: FontWeight.medium,
  },
});
