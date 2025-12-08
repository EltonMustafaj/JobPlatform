import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
    variant?: 'primary' | 'secondary' | 'success' | 'purple' | 'sunset';
    style?: ViewStyle;
    children?: React.ReactNode;
}

export default function GradientBackground({ 
    variant = 'primary', 
    style,
    children 
}: GradientBackgroundProps) {
    const gradients = {
        primary: {
            colors: ['#0EA5E9', '#3B82F6', '#6366F1'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
        secondary: {
            colors: ['#8B5CF6', '#EC4899', '#F43F5E'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
        success: {
            colors: ['#10B981', '#14B8A6', '#06B6D4'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
        purple: {
            colors: ['#6366F1', '#8B5CF6', '#A855F7'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
        sunset: {
            colors: ['#F59E0B', '#EF4444', '#EC4899'] as const,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
        },
    };

    const gradient = gradients[variant];

    return (
        <LinearGradient
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
            style={[styles.gradient, style]}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});
