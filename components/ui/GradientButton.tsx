import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type GradientButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'purple';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
    variant?: GradientButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    animated?: boolean;
}

export default function GradientButton({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    children,
    disabled,
    style,
    onPress,
    animated = true,
    ...props
}: GradientButtonProps) {
    const scale = useSharedValue(1);

    const gradients = {
        primary: ['#0EA5E9', '#3B82F6'] as const,
        secondary: ['#8B5CF6', '#EC4899'] as const,
        success: ['#10B981', '#14B8A6'] as const,
        danger: ['#EF4444', '#F97316'] as const,
        purple: ['#6366F1', '#8B5CF6'] as const,
    };

    const sizeStyles = {
        sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
        md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 },
        lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
    };

    const handlePressIn = () => {
        if (animated) {
            scale.value = withSpring(0.95);
        }
    };

    const handlePressOut = () => {
        if (animated) {
            scale.value = withSpring(1);
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const buttonStyles: ViewStyle[] = [
        styles.base,
        sizeStyles[size],
        ...(fullWidth ? [styles.fullWidth] : []),
        ...((disabled || loading) ? [styles.disabled] : []),
        ...(style ? [style] : []),
    ];

    const textStyles: TextStyle[] = [
        styles.text,
        { fontSize: sizeStyles[size].fontSize },
        ...((disabled || loading) ? [styles.textDisabled] : []),
    ];

    return (
        <AnimatedTouchable
            style={[animatedStyle, buttonStyles]}
            disabled={disabled || loading}
            activeOpacity={0.9}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            {...props}
        >
            <LinearGradient
                colors={disabled ? ['#9CA3AF', '#9CA3AF'] : gradients[variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.lg }]}
            />
            {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
            ) : (
                <>
                    {icon && icon}
                    <Text style={textStyles}>{children}</Text>
                </>
            )}
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        overflow: 'hidden',
        ...Shadow.lg,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: Colors.white,
        fontWeight: FontWeight.bold,
        zIndex: 1,
    },
    textDisabled: {
        opacity: 0.7,
    },
});
