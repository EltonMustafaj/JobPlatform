import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Theme';
import { JobType } from '@/lib/supabase';
import Badge from './ui/Badge';

export interface FilterOptions {
    jobTypes: JobType[];
    locations: string[];
    workModes: string[]; // NEW: remote, hybrid, onsite
    experienceLevels: string[]; // NEW: entry, mid, senior, executive
    salaryRange: { min: number; max: number } | null; // NEW: salary filter
    datePosted: 'all' | '24h' | 'week' | 'month'; // NEW: date filter
    sortBy: 'newest' | 'oldest' | 'salary_high' | 'salary_low';
}

interface FilterPanelProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onClearAll: () => void;
    availableLocations?: string[];
}

export default function FilterPanel({
    filters,
    onFilterChange,
    onClearAll,
    availableLocations = ['Prishtinë', 'Prizren', 'Pejë', 'Gjakovë', 'Ferizaj', 'Gjilan'],
}: FilterPanelProps) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);

    const jobTypeOptions: { value: JobType; label: string }[] = [
        { value: 'full-time', label: 'Kohë e Plotë' },
        { value: 'part-time', label: 'Me Orar' },
        { value: 'contract', label: 'Kontratë' },
        { value: 'internship', label: 'Praktikë' },
    ];

    const workModeOptions: { value: string; label: string }[] = [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'onsite', label: 'Onsite' },
    ];

    const experienceOptions: { value: string; label: string }[] = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior' },
        { value: 'executive', label: 'Executive' },
    ];

    const datePostedOptions: { value: FilterOptions['datePosted']; label: string }[] = [
        { value: 'all', label: 'Të gjitha' },
        { value: '24h', label: 'Last 24h' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
    ];

    const sortOptions: { value: FilterOptions['sortBy']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { value: 'newest', label: 'Më të Rejat', icon: 'time-outline' },
        { value: 'oldest', label: 'Më të Vjetrat', icon: 'time' },
        { value: 'salary_high', label: 'Paga: E Lartë → E Ulët', icon: 'trending-up' },
        { value: 'salary_low', label: 'Paga: E Ulët → E Lartë', icon: 'trending-down' },
    ];

    const toggleJobType = (type: JobType) => {
        const newTypes = filters.jobTypes.includes(type)
            ? filters.jobTypes.filter(t => t !== type)
            : [...filters.jobTypes, type];
        onFilterChange({ ...filters, jobTypes: newTypes });
    };

    const toggleLocation = (location: string) => {
        const newLocations = filters.locations.includes(location)
            ? filters.locations.filter(l => l !== location)
            : [...filters.locations, location];
        onFilterChange({ ...filters, locations: newLocations });
    };

    const toggleWorkMode = (mode: string) => {
        const newModes = filters.workModes.includes(mode)
            ? filters.workModes.filter(m => m !== mode)
            : [...filters.workModes, mode];
        onFilterChange({ ...filters, workModes: newModes });
    };

    const toggleExperienceLevel = (level: string) => {
        const newLevels = filters.experienceLevels.includes(level)
            ? filters.experienceLevels.filter(l => l !== level)
            : [...filters.experienceLevels, level];
        onFilterChange({ ...filters, experienceLevels: newLevels });
    };

    const hasActiveFilters = 
        filters.jobTypes.length > 0 || 
        filters.locations.length > 0 || 
        filters.workModes.length > 0 ||
        filters.experienceLevels.length > 0 ||
        filters.salaryRange !== null ||
        filters.datePosted !== 'all';

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Filtro Punët</Text>
                {hasActiveFilters && (
                    <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
                        <Text style={[styles.clearText, { color: Colors.primary[500] }]}>Pastro të gjitha</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Job Type Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Lloji i Punës</Text>
                    <View style={styles.optionsGrid}>
                        {jobTypeOptions.map((option) => {
                            const isSelected = filters.jobTypes.includes(option.value);
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.option,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.optionSelected,
                                    ]}
                                    onPress={() => toggleJobType(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: colors.text },
                                        isSelected && styles.optionTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Location Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Lokacioni</Text>
                    <View style={styles.optionsWrap}>
                        {availableLocations.map((location) => {
                            const isSelected = filters.locations.includes(location);
                            return (
                                <TouchableOpacity
                                    key={location}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.chipSelected,
                                    ]}
                                    onPress={() => toggleLocation(location)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: colors.text },
                                        isSelected && styles.chipTextSelected,
                                    ]}>
                                        {location}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Work Mode Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Mënyra e Punës</Text>
                    <View style={styles.optionsGrid}>
                        {workModeOptions.map((option) => {
                            const isSelected = filters.workModes.includes(option.value);
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.option,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.optionSelected,
                                    ]}
                                    onPress={() => toggleWorkMode(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: colors.text },
                                        isSelected && styles.optionTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Experience Level Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Niveli i Përvojës</Text>
                    <View style={styles.optionsWrap}>
                        {experienceOptions.map((option) => {
                            const isSelected = filters.experienceLevels.includes(option.value);
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.chipSelected,
                                    ]}
                                    onPress={() => toggleExperienceLevel(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: colors.text },
                                        isSelected && styles.chipTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Salary Range Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Paga (€/muaj)</Text>
                    <View style={styles.salaryContainer}>
                        <View style={styles.salaryRanges}>
                            {[
                                { min: 0, max: 500, label: '< €500' },
                                { min: 500, max: 1000, label: '€500 - €1000' },
                                { min: 1000, max: 2000, label: '€1000 - €2000' },
                                { min: 2000, max: 99999, label: '€2000+' },
                            ].map((range) => {
                                const isSelected = 
                                    filters.salaryRange?.min === range.min && 
                                    filters.salaryRange?.max === range.max;
                                return (
                                    <TouchableOpacity
                                        key={range.label}
                                        style={[
                                            styles.chip,
                                            { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                            isSelected && styles.chipSelected,
                                        ]}
                                        onPress={() => onFilterChange({
                                            ...filters,
                                            salaryRange: isSelected ? null : { min: range.min, max: range.max }
                                        })}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            { color: colors.text },
                                            isSelected && styles.chipTextSelected,
                                        ]}>
                                            {range.label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary[500]} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Date Posted Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data e Publikimit</Text>
                    <View style={styles.optionsWrap}>
                        {datePostedOptions.map((option) => {
                            const isSelected = filters.datePosted === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.chipSelected,
                                    ]}
                                    onPress={() => onFilterChange({ ...filters, datePosted: option.value })}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: colors.text },
                                        isSelected && styles.chipTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Sort By */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Rendit Sipas</Text>
                    <View style={styles.sortOptions}>
                        {sortOptions.map((option) => {
                            const isSelected = filters.sortBy === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isSelected && styles.sortOptionSelected,
                                    ]}
                                    onPress={() => onFilterChange({ ...filters, sortBy: option.value })}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={20}
                                        color={isSelected ? Colors.primary[500] : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.sortText,
                                        { color: colors.text },
                                        isSelected && styles.sortTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadow.md,
        marginBottom: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    clearButton: {
        padding: Spacing.xs,
    },
    clearText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        width: '48%',
    },
    optionSelected: {
        backgroundColor: Colors.primary[100],
        borderColor: Colors.primary[500],
        borderWidth: 2,
    },
    optionEmoji: {
        fontSize: 18,
    },
    optionText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    optionTextSelected: {
        color: Colors.primary[700],
        fontWeight: FontWeight.bold,
    },
    optionsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: Colors.primary[100],
        borderColor: Colors.primary[500],
        borderWidth: 2,
    },
    chipText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    chipTextSelected: {
        color: Colors.primary[700],
        fontWeight: FontWeight.bold,
    },
    sortOptions: {
        gap: Spacing.sm,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    sortOptionSelected: {
        backgroundColor: Colors.primary[100],
        borderColor: Colors.primary[500],
        borderWidth: 2,
    },
    sortText: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.medium,
    },
    sortTextSelected: {
        color: Colors.primary[700],
        fontWeight: FontWeight.bold,
    },
    salaryContainer: {
        gap: Spacing.sm,
    },
    salaryRanges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
});
