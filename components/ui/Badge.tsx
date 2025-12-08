import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function Badge({
    variant = 'neutral',
    size = 'md',
    children,
    style,
}: BadgeProps) {
    return (
        <View
            style={[
                styles.base,
                styles[variant],
                styles[`size_${size}`],
                style,
            ]}
        >
            <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        alignSelf: 'flex-start',
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    // Variants
    success: {
        backgroundColor: Colors.success[100],
    },
    warning: {
        backgroundColor: Colors.warning[100],
    },
    error: {
        backgroundColor: Colors.error[100],
    },
    info: {
        backgroundColor: Colors.info[100],
    },
    neutral: {
        backgroundColor: Colors.neutral[100],
    },
    primary: {
        backgroundColor: Colors.primary[100],
    },

    // Sizes
    size_sm: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    size_md: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    size_lg: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },

    // Text styles
    text: {
        fontWeight: FontWeight.semibold,
    },
    text_success: {
        color: Colors.success[700],
    },
    text_warning: {
        color: Colors.warning[700],
    },
    text_error: {
        color: Colors.error[700],
    },
    text_info: {
        color: Colors.info[700],
    },
    text_neutral: {
        color: Colors.neutral[700],
    },
    text_primary: {
        color: Colors.primary[700],
    },

    // Text sizes
    text_sm: {
        fontSize: FontSize.xs,
    },
    text_md: {
        fontSize: FontSize.sm,
    },
    text_lg: {
        fontSize: FontSize.base,
    },
});
