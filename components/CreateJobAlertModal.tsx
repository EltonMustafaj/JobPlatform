import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Input, Button } from '@/components/ui';

interface JobAlert {
    id?: string;
    alert_name: string;
    search_query?: string;
    job_type?: string;
    location?: string;
    work_mode?: string;
    experience_level?: string;
    min_salary?: number;
    frequency: 'instant' | 'daily' | 'weekly';
    is_active: boolean;
}

interface CreateJobAlertModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (alert: JobAlert) => void;
    initialFilters?: {
        searchQuery?: string;
        jobType?: string;
        location?: string;
        workMode?: string;
        experienceLevel?: string;
    };
}

export default function CreateJobAlertModal({
    visible,
    onClose,
    onSave,
    initialFilters,
}: CreateJobAlertModalProps) {
    const { isDark } = useTheme();
    const [alertName, setAlertName] = useState('');
    const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
    const [isActive, setIsActive] = useState(true);

    const colors = {
        background: isDark ? '#1F2937' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        cardBg: isDark ? '#374151' : '#F9FAFB',
    };

    useEffect(() => {
        if (visible && initialFilters) {
            // Auto-generate alert name from filters
            const parts = [];
            if (initialFilters.jobType) parts.push(initialFilters.jobType);
            if (initialFilters.location) parts.push(initialFilters.location);
            if (initialFilters.workMode) parts.push(initialFilters.workMode);
            
            if (parts.length > 0) {
                setAlertName(parts.join(' - '));
            }
        }
    }, [visible, initialFilters]);

    const handleSave = () => {
        if (!alertName.trim()) {
            Alert.alert('Error', 'Ju lutem vendosni një emër për alert');
            return;
        }

        const alert: JobAlert = {
            alert_name: alertName,
            search_query: initialFilters?.searchQuery,
            job_type: initialFilters?.jobType,
            location: initialFilters?.location,
            work_mode: initialFilters?.workMode,
            experience_level: initialFilters?.experienceLevel,
            frequency,
            is_active: isActive,
        };

        onSave(alert);
        resetForm();
    };

    const resetForm = () => {
        setAlertName('');
        setFrequency('daily');
        setIsActive(true);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const frequencyOptions: { value: JobAlert['frequency']; label: string; description: string }[] = [
        { value: 'instant', label: 'Menjëherë', description: 'Merrni email sa herë që postohet një punë e re' },
        { value: 'daily', label: 'Çdo ditë', description: 'Përmbledhje ditore e punëve të reja' },
        { value: 'weekly', label: 'Çdo javë', description: 'Përmbledhje javore e punëve të reja' },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Krijo Job Alert
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Merrni notifikime kur postohen punë që përputhen me kriteret tuaja
                        </Text>

                        {/* Current Filters Preview */}
                        {initialFilters && (
                            <View style={[styles.filtersPreview, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                                <Text style={[styles.filtersTitle, { color: colors.text }]}>
                                    Kriteret e zgjedhura:
                                </Text>
                                <View style={styles.filtersList}>
                                    {initialFilters.searchQuery && (
                                        <View style={styles.filterChip}>
                                            <Ionicons name="search" size={14} color="#0EA5E9" />
                                            <Text style={styles.filterChipText}>{initialFilters.searchQuery}</Text>
                                        </View>
                                    )}
                                    {initialFilters.jobType && (
                                        <View style={styles.filterChip}>
                                            <Ionicons name="briefcase" size={14} color="#10B981" />
                                            <Text style={styles.filterChipText}>{initialFilters.jobType}</Text>
                                        </View>
                                    )}
                                    {initialFilters.location && (
                                        <View style={styles.filterChip}>
                                            <Ionicons name="location" size={14} color="#F59E0B" />
                                            <Text style={styles.filterChipText}>{initialFilters.location}</Text>
                                        </View>
                                    )}
                                    {initialFilters.workMode && (
                                        <View style={styles.filterChip}>
                                            <Ionicons name="laptop" size={14} color="#8B5CF6" />
                                            <Text style={styles.filterChipText}>{initialFilters.workMode}</Text>
                                        </View>
                                    )}
                                    {initialFilters.experienceLevel && (
                                        <View style={styles.filterChip}>
                                            <Ionicons name="trophy" size={14} color="#EF4444" />
                                            <Text style={styles.filterChipText}>{initialFilters.experienceLevel}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Alert Name */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Emri i Alert-it *
                            </Text>
                            <Input
                                value={alertName}
                                onChangeText={setAlertName}
                                placeholder="p.sh. Software Engineer në Prishtinë"
                                style={[styles.input, { backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }]}
                            />
                        </View>

                        {/* Frequency */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Sa shpesh dëshironi të merrni email?
                            </Text>
                            <View style={styles.frequencyOptions}>
                                {frequencyOptions.map((option) => {
                                    const isSelected = frequency === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.frequencyOption,
                                                { backgroundColor: colors.cardBg, borderColor: colors.border },
                                                isSelected && styles.frequencyOptionSelected,
                                            ]}
                                            onPress={() => setFrequency(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.frequencyHeader}>
                                                <Text style={[
                                                    styles.frequencyLabel,
                                                    { color: colors.text },
                                                    isSelected && styles.frequencyLabelSelected,
                                                ]}>
                                                    {option.label}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons name="checkmark-circle" size={20} color="#0EA5E9" />
                                                )}
                                            </View>
                                            <Text style={[styles.frequencyDescription, { color: colors.textSecondary }]}>
                                                {option.description}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Active Status */}
                        <View style={[styles.activeRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                            <View style={styles.activeTextContainer}>
                                <Text style={[styles.activeLabel, { color: colors.text }]}>
                                    Alert Aktiv
                                </Text>
                                <Text style={[styles.activeDescription, { color: colors.textSecondary }]}>
                                    Merrni notifikime për këtë alert
                                </Text>
                            </View>
                            <Switch
                                value={isActive}
                                onValueChange={setIsActive}
                                trackColor={{ false: '#9CA3AF', true: '#0EA5E9' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                Anulo
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Ionicons name="notifications" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Krijo Alert</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    scrollContent: {
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    filtersPreview: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    filtersTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    filtersList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    filterChipText: {
        fontSize: 13,
        color: '#1E40AF',
        fontWeight: '500',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
    },
    frequencyOptions: {
        gap: 12,
    },
    frequencyOption: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    frequencyOptionSelected: {
        borderColor: '#0EA5E9',
        borderWidth: 2,
        backgroundColor: '#EFF6FF',
    },
    frequencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    frequencyEmoji: {
        fontSize: 20,
    },
    frequencyLabel: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    frequencyLabelSelected: {
        color: '#0EA5E9',
    },
    frequencyDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    activeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    activeTextContainer: {
        flex: 1,
    },
    activeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    activeDescription: {
        fontSize: 13,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#0EA5E9',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
