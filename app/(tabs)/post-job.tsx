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
    Animated,
} from 'react-native';
import { supabase, JobType } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/contexts/ThemeContext';
import { triggerJobRefresh } from '@/lib/jobRefresh';

export default function PostJobScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState<JobType>('full-time');
    const [deadlineMode, setDeadlineMode] = useState<'days' | 'date'>('days');
    const [deadlineDays, setDeadlineDays] = useState('30');
    const [deadlineDate, setDeadlineDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();

    // Dynamic theme colors
    const colors = {
        background: isDark ? '#1F2937' : '#F9FAFB',
        cardBackground: isDark ? '#374151' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        inputBg: isDark ? '#4B5563' : '#F9FAFB',
    };

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const calculateDeadline = () => {
        if (deadlineMode === 'days') {
            const days = parseInt(deadlineDays) || 30;
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        }
        return deadlineDate;
    };

    const checkAndNotifyAlerts = async (job: any) => {
        try {
            // Get all active job alerts
            const { data: alerts, error: alertError } = await supabase
                .from('job_alerts')
                .select('*')
                .eq('is_active', true);

            if (alertError) throw alertError;
            if (!alerts || alerts.length === 0) return;

            // Check which alerts match this job
            const matchingAlerts = alerts.filter(alert => {
                let matches = true;

                // Check search query (title or description contains the query)
                if (alert.search_query) {
                    const query = alert.search_query.toLowerCase();
                    const titleMatch = job.title.toLowerCase().includes(query);
                    const descMatch = job.description.toLowerCase().includes(query);
                    if (!titleMatch && !descMatch) matches = false;
                }

                // Check job type
                if (alert.job_type && alert.job_type !== job.job_type) {
                    matches = false;
                }

                // Check location
                if (alert.location && !job.location.toLowerCase().includes(alert.location.toLowerCase())) {
                    matches = false;
                }

                // Check work mode
                if (alert.work_mode && alert.work_mode !== job.work_mode) {
                    matches = false;
                }

                // Check experience level
                if (alert.experience_level && alert.experience_level !== job.experience_level) {
                    matches = false;
                }

                return matches;
            });

            // Create notifications for matching alerts
            if (matchingAlerts.length > 0) {
                const notifications = matchingAlerts.map(alert => ({
                    user_id: alert.user_id,
                    job_id: job.id,
                    alert_id: alert.id,
                    title: `Punë e re: ${job.title}`,
                    message: `Një punë e re që përputhet me alert-in tuaj "${alert.alert_name}" është postuar.`,
                    is_read: false,
                    created_at: new Date().toISOString(),
                }));

                const { error: notifError } = await supabase
                    .from('job_notifications')
                    .insert(notifications);

                if (notifError) {
                    console.error('Error creating notifications:', notifError);
                }
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
            // Don't throw - notification failure shouldn't stop job posting
        }
    };

    const handlePostJob = async () => {
        console.log('📝 [DEBUG] Starting job post...');
        if (!title || !description || !location || !salary) {
            Alert.alert('Kujdes', 'Ju lutem plotesoni te gjitha fushat e detyrueshme (*)');
            return;
        }

        if (deadlineMode === 'days' && (!deadlineDays || parseInt(deadlineDays) < 1)) {
            Alert.alert('Kujdes', 'Ju lutem vendosni një numër të vlefshëm ditësh (minimum 1)');
            return;
        }

        setLoading(true);
        try {
            console.log('👤 [DEBUG] Getting current user...');
            const userData = await getCurrentUser();
            if (!userData?.user) {
                throw new Error('Ju duhet te jeni te kycur per te postuar pune');
            }

            const finalDeadline = calculateDeadline();
            console.log('💾 [DEBUG] Inserting job to DB using RPC...');

            // Use the insert_job function to bypass the "schema net" error
            const { data: newJobData, error } = await supabase.rpc('insert_job', {
                p_employer_id: userData.user.id,
                p_title: title,
                p_description: description,
                p_location: location,
                p_salary: salary,
                p_job_type: jobType,
                p_deadline: finalDeadline,
                p_is_active: true,
            });

            if (error) {
                console.log('❌ [DEBUG] RPC Error:', error);
                throw error;
            }

            // newJobData is an array with one item
            const newJob = Array.isArray(newJobData) ? newJobData[0] : newJobData;
            console.log('✅ [DEBUG] Job created:', newJob?.id);

            // Check for matching job alerts and create notifications
            if (newJob) {
                console.log('🔔 [DEBUG] Checking job alerts...');
                await checkAndNotifyAlerts(newJob);
                console.log('✅ [DEBUG] Alerts checked');
            }

            // 🔄 Trigger refresh për të gjitha listat
            console.log('🔄 [DEBUG] Triggering job refresh...');
            await triggerJobRefresh();

            console.log('🎉 [DEBUG] Showing success alert...');
            Alert.alert(
                'Sukses',
                'Puna u postua me sukses!',
                [{ 
                    text: 'OK', 
                    onPress: () => {
                        console.log('🔙 [DEBUG] Navigating back...');
                        router.back();
                    }
                }]
            );

            // COMMENTED OUT TOAST - Testing if this causes the issue
            // Toast.show({
            //     type: 'success',
            //     text1: 'Sukses',
            //     text2: 'Puna u postua me sukses!',
            //     position: 'bottom',
            // });

            // console.log('⏱️ [DEBUG] Waiting before navigation...');
            // setTimeout(() => {
            //     console.log('🔙 [DEBUG] Navigating back...');
            //     router.back();
            // }, 1500);

            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
            setSalary('');
            setJobType('full-time');
            setDeadlineDays('30');
            setDeadlineDate(new Date().toISOString().split('T')[0]);
        } catch (error: any) {
            console.log('❌ [DEBUG] Error in handlePostJob:', error);
            Alert.alert('Gabim', error.message || 'Ndodhi nje gabim gjate postimit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={[styles.pageTitle, { color: colors.text }]}>Posto nje Pune</Text>
                            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Gjeni talentin ideal per kompanine tuaj</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Titulli i Pozicionit *</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="p.sh. Senior React Native Developer"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Pershkrimi i Punes *</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Pershkruani pergjegjesite, kerkesat dhe benefitet..."
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Location & Salary Row */}
                    <View style={styles.row}>
                        <View style={[styles.formGroup, styles.halfCol]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Lokacioni *</Text>
                            <TextInput
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Prishtine"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            />
                        </View>
                        <View style={[styles.formGroup, styles.halfCol]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Paga *</Text>
                            <TextInput
                                value={salary}
                                onChangeText={setSalary}
                                placeholder="€1000-1500"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            />
                        </View>
                    </View>

                    {/* Job Type */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Lloji i Angazhimit *</Text>
                        <View style={styles.typeContainer}>
                            {(['full-time', 'part-time', 'contract', 'internship'] as JobType[]).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeOption,
                                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                        jobType === type && styles.typeOptionSelected,
                                    ]}
                                    onPress={() => setJobType(type)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.typeText,
                                        { color: colors.textSecondary },
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

                    {/* Deadline Mode Selection */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>⌛ Afati i Aplikimit *</Text>
                        <View style={styles.deadlineModeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                    deadlineMode === 'days' && styles.modeButtonSelected,
                                ]}
                                onPress={() => setDeadlineMode('days')}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.modeButtonText,
                                    { color: colors.textSecondary },
                                    deadlineMode === 'days' && styles.modeButtonTextSelected
                                ]}>
                                    📅 Numër Ditësh
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                    deadlineMode === 'date' && styles.modeButtonSelected,
                                ]}
                                onPress={() => setDeadlineMode('date')}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.modeButtonText,
                                    { color: colors.textSecondary },
                                    deadlineMode === 'date' && styles.modeButtonTextSelected
                                ]}>
                                    📆 Datë Specifike
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Deadline Input based on mode */}
                    {deadlineMode === 'days' ? (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Sa ditë nga sot? *</Text>
                            <TextInput
                                value={deadlineDays}
                                onChangeText={setDeadlineDays}
                                placeholder="30"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="number-pad"
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            />
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                Afati do të jetë: {(() => {
                                    const days = parseInt(deadlineDays) || 30;
                                    const date = new Date();
                                    date.setDate(date.getDate() + days);
                                    return date.toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' });
                                })()}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Zgjidhni datën *</Text>
                            <TextInput
                                value={deadlineDate}
                                onChangeText={setDeadlineDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            />
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>Format: Viti-Muaji-Dita (2025-12-31)</Text>
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handlePostJob}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.button, loading && styles.buttonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Publiko Punen Tani</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 24,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    headerEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#6B7280',
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
    deadlineModeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    modeButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    modeButtonSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#0ea5e9',
        borderWidth: 2,
    },
    modeButtonText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
    },
    modeButtonTextSelected: {
        color: '#0284C7',
        fontWeight: '700',
    },
});
