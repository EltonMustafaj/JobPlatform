/**
 * THEME SYSTEM
 * Centralized theme configuration for consistent design
 */

export const Colors = {
    // Primary Brand Colors
    primary: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9', // Main primary
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
    },

    // Neutral Colors
    neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Success Colors
    success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        500: '#22C55E',
        700: '#15803D',
    },

    // Warning Colors
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        700: '#B45309',
    },

    // Error Colors
    error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        700: '#B91C1C',
    },

    // Info Colors
    info: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        700: '#1D4ED8',
    },

    // Special
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const FontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
};

export const FontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const Shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Theme-specific colors (Light/Dark mode)
export const getThemeColors = (isDark: boolean) => ({
    // Backgrounds
    background: isDark ? Colors.neutral[900] : Colors.neutral[50],
    surface: isDark ? Colors.neutral[800] : Colors.white,
    surfaceVariant: isDark ? Colors.neutral[700] : Colors.neutral[100],

    // Text
    text: isDark ? Colors.neutral[50] : Colors.neutral[900],
    textSecondary: isDark ? Colors.neutral[300] : Colors.neutral[600],
    textTertiary: isDark ? Colors.neutral[400] : Colors.neutral[500],

    // Borders
    border: isDark ? Colors.neutral[700] : Colors.neutral[200],
    borderLight: isDark ? Colors.neutral[800] : Colors.neutral[100],

    // Inputs
    inputBackground: isDark ? Colors.neutral[700] : Colors.neutral[50],
    inputBorder: isDark ? Colors.neutral[600] : Colors.neutral[300],
    inputPlaceholder: isDark ? Colors.neutral[400] : Colors.neutral[500],

    // Primary (same for both themes)
    primary: Colors.primary[500],
    primaryHover: Colors.primary[600],
    primaryLight: Colors.primary[100],

    // Status colors
    success: Colors.success[500],
    successLight: Colors.success[100],
    warning: Colors.warning[500],
    warningLight: Colors.warning[100],
    error: Colors.error[500],
    errorLight: Colors.error[100],
    info: Colors.info[500],
    infoLight: Colors.info[100],
});

export type ThemeColors = ReturnType<typeof getThemeColors>;
