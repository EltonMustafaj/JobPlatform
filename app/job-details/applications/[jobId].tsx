import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    Animated,
    Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase, Profile } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

type Application = {
    id: string;
    job_id: string;
    applicant_id: string;
    cv_url: string | null;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    created_at: string;
    applicant?: Profile;
    message?: string | null;
};

export default function ApplicationsListScreen() {
    const { jobId } = useLocalSearchParams<{ jobId: string }>();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { isDark } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Dynamic theme colors
    const colors = {
        background: isDark ? '#1F2937' : '#F9FAFB',
        cardBackground: isDark ? '#374151' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        headerBg: isDark ? '#111827' : '#fff',
        statBg: isDark ? '#4B5563' : '#F0F9FF',
    };

    useEffect(() => {
        if (jobId) {
            loadApplications();
        }
    }, [jobId]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [applications]);

    const loadApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    applicant:profiles!applications_applicant_id_fkey(*)
                `)
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedData = data?.map(app => ({
                ...app,
                applicant: app.applicant
            })) as Application[];

            setApplications(formattedData || []);
        } catch (error) {
            console.error('Error loading applications:', error);
            Alert.alert('Error', 'Nuk mund të ngarkoheshin aplikimet');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId: string, newStatus: Application['status']) => {
        let message = null;
        if (newStatus === 'accepted') {
            message = "Brenda dy ditësh do t'ju kontaktojmë në emailin tuaj";
        } else if (newStatus === 'rejected') {
            message = "Nuk i keni plotësuar kriteret";
        }

        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    status: newStatus,
                    message: message
                })
                .eq('id', applicationId);

            if (error) throw error;

            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus, message: message } : app
            ));

            if (selectedApplication?.id === applicationId) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus, message: message } : null);
            }

            Alert.alert('Sukses', `Statusi u ndryshua në: ${getStatusLabel(newStatus)}`);
        } catch (error) {
            Alert.alert('Error', 'Nuk mund të përditësohej statusi');
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Në Pritje';
            case 'reviewed': return 'E Shikuar';
            case 'accepted': return 'E Pranuar';
            case 'rejected': return 'E Refuzuar';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'reviewed': return '#3B82F6';
            case 'accepted': return '#10B981';
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'reviewed': return 'eye-outline';
            case 'accepted': return 'checkmark-circle-outline';
            case 'rejected': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

    const openApplication = (app: Application) => {
        setSelectedApplication(app);
        setModalVisible(true);

        if (app.status === 'pending') {
            updateStatus(app.id, 'reviewed');
        }
    };

    // Calculate statistics
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    const renderStatCard = (icon: string, label: string, value: number, color: string) => (
        <View style={[styles.statCard, { backgroundColor: colors.statBg, borderColor: colors.border }]}>
            <Ionicons name={icon as any} size={24} color={color} />
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );

    const renderApplicationItem = ({ item, index }: { item: Application; index: number }) => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => openApplication(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.applicantInfo}>
                        {item.applicant?.photo_url ? (
                            <Image
                                source={{ uri: item.applicant.photo_url }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {item.applicant?.full_name?.charAt(0) || '?'}
                                </Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.applicantName, { color: colors.text }]}>
                                {item.applicant?.full_name || 'Anonim'}
                            </Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                    {item.applicant?.email && (
                        <View style={styles.infoItem}>
                            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                            <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {item.applicant.email}
                            </Text>
                        </View>
                    )}
                    {item.cv_url && (
                        <View style={styles.infoItem}>
                            <Ionicons name="document-text-outline" size={14} color="#0ea5e9" />
                            <Text style={styles.cvIndicator}>CV Attached</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Aplikimet</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Menaxho kandidatët për këtë pozitë
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#0ea5e9" />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Duke ngarkuar...</Text>
                </View>
            ) : applications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Nuk ka aplikime ende</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Kandidatët do të shfaqen këtu kur të aplikojnë
                    </Text>
                </View>
            ) : (
                <>
                    {/* Statistics */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
                        {renderStatCard('people-outline', 'Total', stats.total, '#0ea5e9')}
                        {renderStatCard('time-outline', 'Në Pritje', stats.pending, '#F59E0B')}
                        {renderStatCard('eye-outline', 'Shikuar', stats.reviewed, '#3B82F6')}
                        {renderStatCard('checkmark-circle-outline', 'Pranuar', stats.accepted, '#10B981')}
                        {renderStatCard('close-circle-outline', 'Refuzuar', stats.rejected, '#EF4444')}
                    </ScrollView>

                    {/* Applications List */}
                    <FlatList
                        data={applications}
                        renderItem={renderApplicationItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}

            {/* Application Details Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                {selectedApplication && (
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Detajet e Aplikimit</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Applicant Header */}
                            <View style={[styles.applicantHeader, { backgroundColor: colors.cardBackground }]}>
                                {selectedApplication.applicant?.photo_url ? (
                                    <Image
                                        source={{ uri: selectedApplication.applicant.photo_url }}
                                        style={styles.largeAvatarImage}
                                    />
                                ) : (
                                    <View style={styles.largeAvatar}>
                                        <Text style={styles.largeAvatarText}>
                                            {selectedApplication.applicant?.full_name?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                )}
                                <Text style={[styles.largeName, { color: colors.text }]}>
                                    {selectedApplication.applicant?.full_name || 'Anonim'}
                                </Text>
                                <Text style={[styles.applicantRole, { color: colors.textSecondary }]}>
                                    {selectedApplication.applicant?.headline || 'Punëkërkues'}
                                </Text>
                                <View style={[styles.statusBadge, styles.largeStatusBadge, { backgroundColor: getStatusColor(selectedApplication.status) + '20' }]}>
                                    <Ionicons name={getStatusIcon(selectedApplication.status) as any} size={16} color={getStatusColor(selectedApplication.status)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(selectedApplication.status), fontSize: 14 }]}>
                                        {getStatusLabel(selectedApplication.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Status Actions */}
                            <View style={[styles.statusActions, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    <Ionicons name="options-outline" size={18} color={colors.text} /> Veprime
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            { backgroundColor: isDark ? '#4B5563' : '#F3F4F6' },
                                            selectedApplication.status === 'accepted' && styles.activeActionAccept
                                        ]}
                                        onPress={() => updateStatus(selectedApplication.id, 'accepted')}
                                    >
                                        <Ionicons name="checkmark-circle" size={20} color={selectedApplication.status === 'accepted' ? '#fff' : '#10B981'} />
                                        <Text style={[
                                            styles.actionText,
                                            { color: colors.textSecondary },
                                            selectedApplication.status === 'accepted' && styles.activeActionTextWhite
                                        ]}>Prano</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            { backgroundColor: isDark ? '#4B5563' : '#F3F4F6' },
                                            selectedApplication.status === 'rejected' && styles.activeActionReject
                                        ]}
                                        onPress={() => updateStatus(selectedApplication.id, 'rejected')}
                                    >
                                        <Ionicons name="close-circle" size={20} color={selectedApplication.status === 'rejected' ? '#fff' : '#EF4444'} />
                                        <Text style={[
                                            styles.actionText,
                                            { color: colors.textSecondary },
                                            selectedApplication.status === 'rejected' && styles.activeActionTextWhite
                                        ]}>Refuzo</Text>
                                    </TouchableOpacity>
                                </View>
                                {selectedApplication.message && (
                                    <View style={[styles.messageContainer, { backgroundColor: isDark ? '#4B5563' : '#F8FAFC', borderColor: colors.border }]}>
                                        <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Mesazhi automatik:</Text>
                                        <Text style={[styles.messageText, { color: colors.text }]}>{selectedApplication.message}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Contact Info */}
                            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    <Ionicons name="call-outline" size={18} color={colors.text} /> Kontakt
                                </Text>
                                {selectedApplication.applicant?.email && (
                                    <TouchableOpacity
                                        style={styles.contactItem}
                                        onPress={() => Linking.openURL(`mailto:${selectedApplication.applicant?.email}`)}
                                    >
                                        <Ionicons name="mail" size={20} color="#0ea5e9" />
                                        <Text style={styles.linkText}>{selectedApplication.applicant?.email}</Text>
                                    </TouchableOpacity>
                                )}
                                {selectedApplication.applicant?.phone && (
                                    <TouchableOpacity
                                        style={styles.contactItem}
                                        onPress={() => Linking.openURL(`tel:${selectedApplication.applicant?.phone}`)}
                                    >
                                        <Ionicons name="call" size={20} color="#10B981" />
                                        <Text style={styles.linkText}>{selectedApplication.applicant?.phone}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* CV / Resume */}
                            {selectedApplication.cv_url && (
                                <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        <Ionicons name="document-text-outline" size={18} color={colors.text} /> CV / Dokumente
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.cvButton}
                                        onPress={() => Linking.openURL(selectedApplication.cv_url!)}
                                    >
                                        <Ionicons name="document-text" size={24} color="#0ea5e9" />
                                        <Text style={styles.cvButtonText}>Shiko CV-në</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#0ea5e9" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Experience & Education */}
                            {selectedApplication.applicant?.experience && (
                                <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        <Ionicons name="briefcase-outline" size={18} color={colors.text} /> Eksperienca
                                    </Text>
                                    <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{selectedApplication.applicant.experience}</Text>
                                </View>
                            )}

                            {selectedApplication.applicant?.education && (
                                <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        <Ionicons name="school-outline" size={18} color={colors.text} /> Edukimi
                                    </Text>
                                    <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{selectedApplication.applicant.education}</Text>
                                </View>
                            )}

                            {selectedApplication.applicant?.skills && (
                                <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        <Ionicons name="star-outline" size={18} color={colors.text} /> Aftësitë
                                    </Text>
                                    <View style={styles.skillsContainer}>
                                        {selectedApplication.applicant.skills.split(',').map((skill, index) => (
                                            <View key={index} style={[styles.skillBadge, { backgroundColor: isDark ? '#4B5563' : '#F3F4F6' }]}>
                                                <Text style={[styles.skillText, { color: colors.text }]}>{skill.trim()}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    statsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    statCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        alignItems: 'center',
        minWidth: 100,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    applicantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#F0F9FF',
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#F0F9FF',
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    applicantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        gap: 6,
    },
    largeStatusBadge: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    quickInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    cvIndicator: {
        fontSize: 12,
        color: '#0ea5e9',
        fontWeight: '600',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    applicantHeader: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    largeAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#F0F9FF',
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    largeAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#F0F9FF',
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    largeAvatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    largeName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
        textAlign: 'center',
    },
    applicantRole: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    bodyText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 26,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    linkText: {
        fontSize: 16,
        color: '#0ea5e9',
        fontWeight: '500',
        flex: 1,
    },
    cvButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F9FF',
        padding: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#BAE6FD',
        gap: 12,
    },
    cvButtonText: {
        flex: 1,
        color: '#0284C7',
        fontWeight: '700',
        fontSize: 16,
    },
    statusActions: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        gap: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeActionAccept: {
        backgroundColor: '#10B981',
        borderColor: '#059669',
    },
    activeActionReject: {
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
    },
    actionText: {
        fontWeight: '700',
        color: '#4B5563',
        fontSize: 16,
    },
    activeActionTextWhite: {
        color: '#fff',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
    },
    skillText: {
        color: '#4B5563',
        fontSize: 14,
        fontWeight: '600',
    },
    messageContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageText: {
        fontSize: 15,
        color: '#334155',
        fontStyle: 'italic',
        lineHeight: 24,
    },
});
