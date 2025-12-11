import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Linking,
    Modal,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase, Job, Company } from '@/lib/supabase';
import { getCurrentUser, getCompany } from '@/lib/auth';
import { pickDocument, uploadCV } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { sanitize } from '@/lib/sanitize';
import { triggerJobRefresh } from '@/lib/jobRefresh';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen() {
    const { jobId } = useLocalSearchParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [applicationModalVisible, setApplicationModalVisible] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const { isDark } = useTheme();

    // Dynamic theme colors
    const colors = {
        background: isDark ? '#1F2937' : '#F9FAFB',
        cardBackground: isDark ? '#374151' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        modalBg: isDark ? '#374151' : '#fff',
    };

    useEffect(() => {
        if (jobId) {
            loadJobDetails();
            checkIfApplied();
        }
    }, [jobId]);

    const loadJobDetails = async () => {
        try {
            const { data: jobData, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .maybeSingle();

            if (error) throw error;
            
            if (!jobData) {
                Alert.alert('Error', 'Puna nuk u gjet');
                router.back();
                return;
            }
            
            setJob(jobData);

            // Load company info
            if (jobData.employer_id) {
                try {
                    const companyData = await getCompany(jobData.employer_id);
                    if (companyData) setCompany(companyData);
                } catch (error) {
                    console.log('No company info found');
                }
            }
        } catch (error) {
            console.error('Error loading job:', error);
            Alert.alert('Error', 'Nuk u gjet puna');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const checkIfApplied = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            setCurrentUserId(userData.user.id);
            setUserProfile(userData.profile);

            // Employers shouldn't check if they applied
            if (userData.profile?.role === 'employer') return;

            const { data, error } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', jobId)
                .eq('applicant_id', userData.user.id)
                .maybeSingle();

            if (data) {
                setHasApplied(true);
            }
        } catch (error) {
            // No application found, which is fine
        }
    };

    const handleApplyPress = async () => {
        if (hasApplied) {
            Alert.alert('Info', 'Ju keni aplikuar tashme per kete pune');
            return;
        }

        const userData = await getCurrentUser();
        if (!userData?.user) {
            Alert.alert('Kujdes', 'Ju duhet te jeni te kycur per te aplikuar');
            return;
        }

        setApplicationModalVisible(true);
    };

    const handleApplyWithProfile = () => {
        setApplicationModalVisible(false);
        submitApplication(null);
    };

    const handleApplyWithExistingCV = () => {
        if (userProfile?.cv_url) {
            setApplicationModalVisible(false);
            submitApplication(userProfile.cv_url);
        }
    };

    const handleApplyWithNewCV = async () => {
        setApplicationModalVisible(false);
        const cvUri = await pickDocument();
        if (cvUri) {
            setApplying(true);
            try {
                const userData = await getCurrentUser();
                if (!userData?.user) return;

                const cvUrl = await uploadCV(userData.user.id, cvUri);
                await submitApplication(cvUrl);
            } catch (error: any) {
                Alert.alert('Error', error.message);
                setApplying(false);
            }
        }
    };

    const submitApplication = async (cvUrl: string | null) => {
        setApplying(true);
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) throw new Error('User not found');

            const { error } = await supabase.from('applications').insert({
                job_id: jobId,
                applicant_id: userData.user.id,
                cv_url: cvUrl,
                status: 'pending',
            });

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Info', 'Ju keni aplikuar tashme per kete pune');
                    setHasApplied(true);
                } else {
                    throw error;
                }
            } else {
                setHasApplied(true);
                Alert.alert(
                    'Sukses',
                    'Aplikimi juaj u dergua me sukses!',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi nje gabim');
        } finally {
            setApplying(false);
        }
    };

    const getJobTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'full-time': 'Kohe e Plote',
            'part-time': 'Kohe e Pjesshme',
            'contract': 'Kontrate',
            'internship': 'Praktike',
        };
        return labels[type] || type;
    };

    const handleDeleteJob = async () => {
        Alert.alert(
            'Konfirmo Fshirjen',
            'A jeni i sigurt qe doni ta fshini kete pune? Ky veprim nuk mund te kthehet prapa.',
            [
                { text: 'Anulo', style: 'cancel' },
                {
                    text: 'Fshije',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const userData = await getCurrentUser();
                            if (!userData?.user) {
                                throw new Error('Ju duhet te jeni te kycur');
                            }

                            const { error } = await supabase
                                .from('jobs')
                                .delete()
                                .eq('id', jobId)
                                .eq('employer_id', userData.user.id);

                            if (error) throw error;

                            // 🔄 Trigger refresh për të gjitha listat
                            await triggerJobRefresh();

                            Alert.alert('Sukses', 'Puna u fshi me sukses');
                            router.back();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Nuk mund te fshihej puna');
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const isOwner = currentUserId && job && currentUserId === job.employer_id;

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Duke ngarkuar detajet...</Text>
            </View>
        );
    }

    if (!job) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>Puna nuk u gjet</Text>
            </View>
        );
    }

    const safeJobDescription = sanitize(job.description || '');
    const safeCompanyDescription = sanitize(company?.company_description || '');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Single Content Card */}
                <View style={[styles.singleCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    {/* Job Title */}
                    <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>

                    {/* Job Meta Info */}
                    <View style={styles.metaContainer}>
                        <View style={styles.metaRow}>
                            <Ionicons name="location" size={16} color="#6B7280" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.location}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="cash" size={16} color="#10B981" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.salary}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="briefcase" size={16} color="#0ea5e9" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{getJobTypeLabel(job.job_type)}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="time" size={16} color="#F59E0B" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{new Date(job.deadline).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* Company Badge */}
                    {company && (
                        <View style={styles.companyBadge}>
                            <Ionicons name="business" size={16} color="#fff" />
                            <Text style={styles.companyBadgeText}>{company.company_name}</Text>
                        </View>
                    )}

                    {/* Job Description */}
                    <View style={styles.descriptionHeader}>
                        <Ionicons name="document-text" size={20} color="#0ea5e9" />
                        <Text style={[styles.descriptionTitle, { color: colors.text }]}>Përshkrimi i Punës</Text>
                    </View>
                    <Text style={[styles.descriptionContent, { color: colors.textSecondary }]}>{safeJobDescription}</Text>

                    {/* Company Info - if exists */}
                    {company?.company_description && (
                        <>
                            <View style={[styles.descriptionHeader, { marginTop: 20 }]}>
                                <Ionicons name="information-circle" size={20} color="#10B981" />
                                <Text style={[styles.descriptionTitle, { color: colors.text }]}>Rreth Kompanisë</Text>
                            </View>
                            <Text style={[styles.descriptionContent, { color: colors.textSecondary }]} numberOfLines={3}>
                                {safeCompanyDescription}
                            </Text>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Action Button (Apply or View Applications) */}
            {userProfile && (
                <View style={[styles.applyContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
                    {isOwner ? (
                        <View style={styles.ownerActions}>
                            <TouchableOpacity
                                onPress={() => router.push(`/job-details/applications/${jobId}`)}
                                activeOpacity={0.8}
                                style={[styles.applyButton, styles.viewApplicationsButton, { flex: 1 }]}
                            >
                                <Ionicons name="people" size={24} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.applyButtonText}>Aplikimet</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push(`/edit-job/${jobId}` as any)}
                                activeOpacity={0.8}
                                style={[styles.actionButton, styles.editButton]}
                            >
                                <Ionicons name="create-outline" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDeleteJob}
                                activeOpacity={0.8}
                                style={[styles.actionButton, styles.deleteButton]}
                            >
                                <Ionicons name="trash-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : userProfile.role === 'job_seeker' ? (
                        <TouchableOpacity
                            onPress={handleApplyPress}
                            disabled={applying || hasApplied}
                            activeOpacity={0.8}
                            style={[
                                styles.applyButton,
                                (applying || hasApplied) && styles.applyButtonDisabled,
                            ]}
                        >
                            {applying ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name={hasApplied ? "checkmark-circle" : "rocket"} size={24} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.applyButtonText}>
                                        {hasApplied ? 'Ju keni aplikuar' : 'Apliko Tani'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.applyButton, styles.employerInfoButton]}>
                            <Ionicons name="information-circle" size={24} color="#0ea5e9" style={{ marginRight: 8 }} />
                            <Text style={[styles.applyButtonText, { color: '#0ea5e9' }]}>Vetëm punëkërkuesit mund të aplikojnë</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Custom Application Modal */}
            <Modal
                visible={applicationModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setApplicationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Apliko per Pune</Text>
                            <TouchableOpacity onPress={() => setApplicationModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Zgjidhni menyren e aplikimit:</Text>

                        <TouchableOpacity style={[styles.optionButton, { backgroundColor: isDark ? '#4B5563' : '#F9FAFB', borderColor: colors.border }]} onPress={handleApplyWithProfile}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                                <Ionicons name="person" size={24} color="#0284C7" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Vetem me Profil</Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>Perdor te dhenat nga profili juaj</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {userProfile?.cv_url && (
                            <TouchableOpacity style={[styles.optionButton, { backgroundColor: isDark ? '#4B5563' : '#F9FAFB', borderColor: colors.border }]} onPress={handleApplyWithExistingCV}>
                                <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="document-text" size={24} color="#16A34A" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={[styles.optionTitle, { color: colors.text }]}>Me CV ekzistuese</Text>
                                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>Perdor CV-ne e ngarkuar ne profil</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.optionButton, { backgroundColor: isDark ? '#4B5563' : '#F9FAFB', borderColor: colors.border }]} onPress={handleApplyWithNewCV}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                                <Ionicons name="cloud-upload" size={24} color="#9333EA" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Ngarko CV te re</Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>Ngarko nje dokument te ri PDF/Word</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 16,
    },
    errorText: {
        color: '#6B7280',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    singleCard: {
        margin: 16,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        borderWidth: 1,
    },
    jobTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 20,
        lineHeight: 34,
    },
    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 15,
        fontWeight: '500',
    },
    companyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 10,
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 24,
    },
    companyBadgeText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    descriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    descriptionContent: {
        fontSize: 16,
        lineHeight: 26,
        letterSpacing: 0.2,
    },
    applyContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    applyButton: {
        backgroundColor: '#0ea5e9',
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    ownerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    viewApplicationsButton: {
        flex: 1,
        backgroundColor: '#7C3AED',
        shadowColor: '#7C3AED',
        height: 56, // Ensure same height
    },
    actionButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    editButton: {
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    applyButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
    },
    employerInfoButton: {
        backgroundColor: '#EFF6FF',
        borderWidth: 2,
        borderColor: '#0ea5e9',
        shadowOpacity: 0,
    },
    applyButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 18,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: '#6B7280',
    },
});
