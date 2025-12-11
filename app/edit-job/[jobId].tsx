import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { supabase, JobType } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { triggerJobRefresh } from '@/lib/jobRefresh';

export default function EditJobScreen() {
    const { jobId } = useLocalSearchParams<{ jobId: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState<JobType>('full-time');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    const loadJobDetails = async () => {
        try {
            const { data: job, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (error) throw error;

            setTitle(job.title);
            setDescription(job.description);
            setLocation(job.location);
            setSalary(job.salary);
            setJobType(job.job_type as JobType);
            setDeadline(job.deadline);
        } catch (error) {
            Alert.alert('Error', 'Nuk u gjet puna');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateJob = async () => {
        if (!title || !description || !location || !salary || !deadline) {
            Alert.alert('Kujdes', 'Ju lutem plotesoni te gjitha fushat e detyrueshme (*)');
            return;
        }

        setSaving(true);
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) {
                throw new Error('Ju duhet te jeni te kycur');
            }

            // Check if user is the owner of this job
            const { data: jobData, error: fetchError } = await supabase
                .from('jobs')
                .select('employer_id')
                .eq('id', jobId)
                .single();

            if (fetchError) throw fetchError;

            if (jobData.employer_id !== userData.user.id) {
                throw new Error('Ju nuk keni te drejte te ndryshoni kete pune');
            }

            const { error } = await supabase
                .from('jobs')
                .update({
                    title,
                    description,
                    location,
                    salary,
                    job_type: jobType,
                    deadline,
                })
                .eq('id', jobId)
                .eq('employer_id', userData.user.id);

            if (error) throw error;

            // 🔄 Trigger refresh për të gjitha listat
            await triggerJobRefresh();

            Alert.alert('Sukses', 'Puna u perditesua me sukses!', [
                { text: 'Ne rregull', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Gabim', error.message || 'Ndodhi nje gabim gjate perditesimit');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ndrysho Punen</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Title */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Titulli i Pozicionit *</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="p.sh. Senior React Native Developer"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                    />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Pershkrimi i Punes *</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Pershkruani pergjegjesite..."
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                {/* Location & Salary Row */}
                <View style={styles.row}>
                    <View style={[styles.formGroup, styles.halfCol]}>
                        <Text style={styles.label}>Lokacioni *</Text>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Prishtine"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                        />
                    </View>
                    <View style={[styles.formGroup, styles.halfCol]}>
                        <Text style={styles.label}>Paga *</Text>
                        <TextInput
                            value={salary}
                            onChangeText={setSalary}
                            placeholder="€1000-1500"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Job Type */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Lloji i Angazhimit *</Text>
                    <View style={styles.typeContainer}>
                        {(['full-time', 'part-time', 'contract', 'internship'] as JobType[]).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeOption,
                                    jobType === type && styles.typeOptionSelected,
                                ]}
                                onPress={() => setJobType(type)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.typeText,
                                    jobType === type && styles.typeTextSelected
                                ]}>
                                    {type === 'full-time' && 'Kohe e Plote'}
                                    {type === 'part-time' && 'Me Orar'}
                                    {type === 'contract' && 'Kontrate'}
                                    {type === 'internship' && 'Praktike'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Deadline */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>⏳ Afati i Aplikimit *</Text>
                    <TextInput
                        value={deadline}
                        onChangeText={setDeadline}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                    />
                    <Text style={styles.helperText}>Format: Viti-Muaji-Dita (2025-12-31)</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleUpdateJob}
                    disabled={saving}
                    activeOpacity={0.8}
                    style={[styles.button, saving && styles.buttonDisabled]}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Ruaj Ndryshimet</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfCol: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 2,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    helperText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 6,
        marginLeft: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeOption: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    typeOptionSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0ea5e9',
        borderWidth: 2,
    },
    typeEmoji: {
        fontSize: 18,
    },
    typeText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
    },
    typeTextSelected: {
        color: '#0284C7',
        fontWeight: '700',
    },
    button: {
        backgroundColor: '#0ea5e9',
        borderRadius: 16,
        paddingVertical: 18,
        marginTop: 24,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
});
