import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    children,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        ...(fullWidth ? [styles.fullWidth] : []),
        ...((disabled || loading) ? [styles.disabled] : []),
        ...(style ? [style as ViewStyle] : []),
    ];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        ...((disabled || loading) ? [styles.textDisabled] : []),
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary[500]}
                    size={size === 'sm' ? 'small' : 'small'}
                />
            ) : (
                <>
                    {icon && icon}
                    <Text style={textStyles}>{children}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Base styles
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },

    // Variants
    primary: {
        backgroundColor: Colors.primary[500],
        ...Shadow.md,
    },
    secondary: {
        backgroundColor: Colors.neutral[100],
        borderWidth: 1,
        borderColor: Colors.neutral[200],
    },
    outline: {
        backgroundColor: Colors.transparent,
        borderWidth: 2,
        borderColor: Colors.primary[500],
    },
    ghost: {
        backgroundColor: Colors.transparent,
    },
    danger: {
        backgroundColor: Colors.error[500],
        ...Shadow.md,
    },

    // Sizes
    size_sm: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        minHeight: 36,
    },
    size_md: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minHeight: 44,
    },
    size_lg: {
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.lg,
        minHeight: 52,
    },

    // States
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    text: {
        textAlign: 'center',
        fontWeight: FontWeight.semibold,
    },
    text_primary: {
        color: Colors.white,
    },
    text_secondary: {
        color: Colors.neutral[700],
    },
    text_outline: {
        color: Colors.primary[500],
    },
    text_ghost: {
        color: Colors.primary[500],
    },
    text_danger: {
        color: Colors.white,
    },

    // Text sizes
    text_sm: {
        fontSize: FontSize.sm,
    },
    text_md: {
        fontSize: FontSize.base,
    },
    text_lg: {
        fontSize: FontSize.lg,
    },

    textDisabled: {
        opacity: 0.7,
    },
});
