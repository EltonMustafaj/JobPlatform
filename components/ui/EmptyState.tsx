import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Theme';
import Button from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    emoji?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon,
    emoji,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);

    return (
        <View style={styles.container}>
            {emoji ? (
                <Text style={styles.emoji}>{emoji}</Text>
            ) : icon ? (
                <Ionicons name={icon} size={64} color={colors.textTertiary} />
            ) : null}

            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

            {description && (
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    size="md"
                    onPress={onAction}
                    style={styles.button}
                >
                    {actionLabel}
                </Button>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing['3xl'],
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: FontSize.base,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        maxWidth: 300,
    },
    button: {
        marginTop: Spacing.md,
    },
});
