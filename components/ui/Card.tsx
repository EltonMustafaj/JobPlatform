import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends ViewProps {
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: keyof typeof Spacing;
    children: React.ReactNode;
}

export default function Card({
    variant = 'elevated',
    padding = 'lg',
    children,
    style,
    ...props
}: CardProps) {
    const { isDark } = useTheme();

    const backgroundColor = isDark ? Colors.neutral[800] : Colors.white;
    const borderColor = isDark ? Colors.neutral[700] : Colors.neutral[200];

    const cardStyles: ViewStyle[] = [
        styles.base,
        { padding: Spacing[padding], backgroundColor },
        ...(variant === 'elevated' ? [Shadow.md] : []),
        ...(variant === 'outlined' ? [{ borderWidth: 1, borderColor }] : []),
        ...(variant === 'filled' ? [{
            backgroundColor: isDark ? Colors.neutral[700] : Colors.neutral[50],
        }] : []),
        ...(style ? [style as ViewStyle] : []),
    ];

    return (
        <View style={cardStyles} {...props}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
});
