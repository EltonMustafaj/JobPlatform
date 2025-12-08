import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    required?: boolean;
    onIconPress?: () => void;
}

export default function Input({
    label,
    error,
    hint,
    icon,
    required,
    onIconPress,
    style,
    ...props
}: InputProps) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.inputBackground,
                        borderColor: error
                            ? colors.error
                            : isFocused
                                ? colors.primary
                                : colors.inputBorder,
                    },
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        { color: colors.text },
                        style,
                    ]}
                    placeholderTextColor={colors.inputPlaceholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {icon && (
                    <TouchableOpacity
                        onPress={onIconPress}
                        disabled={!onIconPress}
                        style={styles.iconContainer}
                    >
                        <Ionicons
                            name={icon}
                            size={20}
                            color={error ? colors.error : colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            )}

            {hint && !error && (
                <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    required: {
        color: Colors.error[500],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
    },
    inputFocused: {
        borderWidth: 2,
    },
    inputError: {
        borderWidth: 2,
    },
    input: {
        flex: 1,
        fontSize: FontSize.base,
        paddingVertical: Spacing.md,
    },
    iconContainer: {
        padding: Spacing.xs,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
        gap: Spacing.xs,
    },
    errorText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
    hint: {
        fontSize: FontSize.xs,
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});
