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
                .single();

            if (error) throw error;
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
                .single();

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
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.location, { color: colors.textSecondary }]}>{job.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={18} color="#0ea5e9" />
                        <Text style={styles.salary}>{job.salary}</Text>
                    </View>

                    <View style={styles.badgesRow}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                                {getJobTypeLabel(job.job_type)}
                            </Text>
                        </View>
                        <View style={styles.deadlineBadge}>
                            <Text style={styles.deadlineText}>
                                ⏳ {new Date(job.deadline).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Company Info Section */}
                {company && (
                    <View style={[styles.companySection, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rreth Kompanise</Text>
                        <Text style={[styles.companyName, { color: colors.text }]}>{company.company_name}</Text>

                        {company.company_location && (
                            <View style={styles.companyMetaRow}>
                                <Ionicons name="map-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                <Text style={[styles.companyInfo, { color: colors.textSecondary }]}>{company.company_location}</Text>
                            </View>
                        )}

                        {company.company_website && (
                            <TouchableOpacity
                                style={styles.companyMetaRow}
                                onPress={() => Linking.openURL(company.company_website!)}
                            >
                                <Ionicons name="globe-outline" size={16} color="#0ea5e9" />
                                <Text style={styles.companyLink}>{company.company_website}</Text>
                            </TouchableOpacity>
                        )}

                        {company.company_description && (
                            <Text style={[styles.companyDescription, { color: colors.textSecondary }]}>{safeCompanyDescription}</Text>
                        )}
                    </View>
                )}

                {/* Description Section */}
                <View style={[styles.descriptionSection, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Pershkrimi i Punes</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{safeJobDescription}</Text>
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
    header: {
        backgroundColor: '#fff',
        padding: 24,
        marginBottom: 12,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
        lineHeight: 36,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    location: {
        fontSize: 16,
        color: '#6B7280',
        marginLeft: 6,
    },
    salary: {
        fontSize: 20,
        color: '#0ea5e9',
        fontWeight: '700',
        marginLeft: 6,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    typeBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    typeBadgeText: {
        color: '#0284C7',
        fontSize: 14,
        fontWeight: '600',
    },
    deadlineBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    deadlineText: {
        color: '#B45309',
        fontSize: 14,
        fontWeight: '600',
    },
    companySection: {
        backgroundColor: '#fff',
        padding: 24,
        marginBottom: 12,
        borderRadius: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    companyMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    companyInfo: {
        fontSize: 15,
        color: '#6B7280',
        marginLeft: 8,
    },
    companyLink: {
        fontSize: 15,
        color: '#0ea5e9',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
    companyDescription: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
        marginTop: 12,
    },
    descriptionSection: {
        backgroundColor: '#fff',
        padding: 24,
        paddingBottom: 40,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 28,
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
