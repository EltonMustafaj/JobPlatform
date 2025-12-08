import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Shadow } from '@/constants/Theme';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    intensity?: 'light' | 'medium' | 'strong';
    variant?: 'default' | 'gradient' | 'colored';
    borderGlow?: boolean;
    padding?: number;
}

export default function GlassCard({
    children,
    intensity = 'medium',
    variant = 'default',
    borderGlow = false,
    padding = 16,
    style,
    ...props
}: GlassCardProps) {
    const { isDark } = useTheme();

    // Glass effect colors based on theme
    const glassColors = {
        light: {
            light: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] as const,
            medium: ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.65)'] as const,
            strong: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'] as const,
        },
        dark: {
            light: ['rgba(31, 41, 55, 0.7)', 'rgba(31, 41, 55, 0.5)'] as const,
            medium: ['rgba(31, 41, 55, 0.85)', 'rgba(31, 41, 55, 0.65)'] as const,
            strong: ['rgba(31, 41, 55, 0.95)', 'rgba(31, 41, 55, 0.85)'] as const,
        },
    };

    const gradientColors = isDark
        ? (['rgba(14, 165, 233, 0.15)', 'rgba(139, 92, 246, 0.15)'] as const)
        : (['rgba(14, 165, 233, 0.1)', 'rgba(139, 92, 246, 0.1)'] as const);

    const coloredGradients = isDark
        ? (['rgba(14, 165, 233, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)'] as const)
        : (['rgba(14, 165, 233, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(139, 92, 246, 0.15)'] as const);

    const baseColors = glassColors[isDark ? 'dark' : 'light'][intensity];
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const borderGlowColor = isDark
        ? 'rgba(14, 165, 233, 0.3)'
        : 'rgba(14, 165, 233, 0.2)';

    if (variant === 'gradient') {
        return (
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.base,
                    {
                        padding,
                        borderWidth: 1,
                        borderColor: borderGlow ? borderGlowColor : borderColor,
                    },
                    Shadow.lg,
                    style as ViewStyle,
                ]}
                {...props}
            >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.6)' }]} />
                <View style={styles.content}>{children}</View>
            </LinearGradient>
        );
    }

    if (variant === 'colored') {
        return (
            <LinearGradient
                colors={coloredGradients}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.base,
                    {
                        padding,
                        borderWidth: 1.5,
                        borderColor: borderGlowColor,
                    },
                    Shadow.xl,
                    style as ViewStyle,
                ]}
                {...props}
            >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)' }]} />
                <View style={styles.content}>{children}</View>
            </LinearGradient>
        );
    }

    // Default glass card
    return (
        <LinearGradient
            colors={baseColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.base,
                {
                    padding,
                    borderWidth: 1,
                    borderColor: borderGlow ? borderGlowColor : borderColor,
                },
                Shadow.md,
                style as ViewStyle,
            ]}
            {...props}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    content: {
        zIndex: 1,
    },
});
