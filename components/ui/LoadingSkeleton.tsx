import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

export function LoadingSkeleton({
    width = '100%',
    height = 20,
    borderRadius = BorderRadius.md,
    style,
}: LoadingSkeletonProps) {
    const { isDark } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: isDark ? Colors.neutral[700] : Colors.neutral[200],
                    opacity,
                    overflow: 'hidden',
                } as any,
                style,
            ]}
        />
    );
}

// Predefined skeleton layouts
export function JobCardSkeleton() {
    return (
        <View style={styles.card}>
            <LoadingSkeleton width="60%" height={24} />
            <View style={{ height: Spacing.sm }} />
            <LoadingSkeleton width="40%" height={16} />
            <View style={{ height: Spacing.md }} />
            <LoadingSkeleton width="100%" height={60} />
            <View style={{ height: Spacing.md }} />
            <View style={styles.row}>
                <LoadingSkeleton width={80} height={32} borderRadius={BorderRadius.full} />
                <LoadingSkeleton width={100} height={32} borderRadius={BorderRadius.full} />
            </View>
        </View>
    );
}

export function ProfileSkeleton() {
    return (
        <View style={styles.profileContainer}>
            <LoadingSkeleton width={100} height={100} borderRadius={BorderRadius.full} />
            <View style={{ height: Spacing.lg }} />
            <LoadingSkeleton width="60%" height={28} />
            <View style={{ height: Spacing.sm }} />
            <LoadingSkeleton width="40%" height={18} />
            <View style={{ height: Spacing.xl }} />
            <LoadingSkeleton width="100%" height={120} />
        </View>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={{ marginBottom: Spacing.md }}>
                    <JobCardSkeleton />
                </View>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.white,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    profileContainer: {
        alignItems: 'center',
        padding: Spacing['2xl'],
    },
});
