import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Kërko punë...',
    onClear,
}: SearchBarProps) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);

    return (
        <View style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />

            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.inputPlaceholder}
            />

            {value.length > 0 && (
                <TouchableOpacity onPress={onClear || (() => onChangeText(''))} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        ...Shadow.sm,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSize.base,
        paddingVertical: Spacing.xs,
    },
    clearButton: {
        padding: Spacing.xs,
    },
});
