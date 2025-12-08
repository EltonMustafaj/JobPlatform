import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnimatedSkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    variant?: 'rect' | 'circle' | 'text';
}

export default function AnimatedSkeleton({
    width: customWidth = '100%',
    height = 20,
    borderRadius = 8,
    variant = 'rect',
}: AnimatedSkeletonProps) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const getStyles = () => {
        if (variant === 'circle') {
            return {
                width: height,
                height: height,
                borderRadius: height / 2,
            };
        }
        if (variant === 'text') {
            return {
                width: customWidth,
                height: height,
                borderRadius: 4,
            };
        }
        return {
            width: customWidth,
            height: height,
            borderRadius: borderRadius,
        };
    };

    const skeletonStyles = getStyles() as any;
    
    return (
        <View style={skeletonStyles}>
            <Animated.View style={[styles.skeleton, StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['#E5E7EB', '#F3F4F6', '#E5E7EB'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

export function JobCardSkeleton() {
    return (
        <View style={styles.jobCardSkeleton}>
            <View style={styles.skeletonHeader}>
                <AnimatedSkeleton width="70%" height={24} />
                <AnimatedSkeleton variant="circle" height={40} />
            </View>
            <View style={styles.skeletonMeta}>
                <AnimatedSkeleton width="40%" height={16} />
                <AnimatedSkeleton width="30%" height={16} />
            </View>
            <View style={styles.skeletonBadges}>
                <AnimatedSkeleton width={100} height={28} borderRadius={14} />
                <AnimatedSkeleton width={80} height={28} borderRadius={14} />
            </View>
            <AnimatedSkeleton width="100%" height={60} />
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    jobCardSkeleton: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skeletonMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    skeletonBadges: {
        flexDirection: 'row',
        gap: 8,
    },
});
