import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { supabase, Application, Job } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { subscribeToJobRefresh } from '@/lib/jobRefresh';

type ApplicationWithJob = Application & {
    jobs: Job;
};

export default function MyApplicationsScreen() {
    const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isDark } = useTheme();

    // Dynamic theme colors
    const colors = {
        background: isDark ? '#1F2937' : '#F9FAFB',
        cardBackground: isDark ? '#374151' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
    };

    useEffect(() => {
        loadApplications();
        
        // 🔄 Subscribe për auto-refresh kur krijohet/updatohet/fshihet një punë
        const unsubscribe = subscribeToJobRefresh(() => {
            loadApplications();
        });
        
        return () => unsubscribe();
    }, []);

    const loadApplications = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          jobs (*)
        `)
                .eq('applicant_id', userData.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications((data as ApplicationWithJob[]) || []);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadApplications();
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return { bg: styles.statusPending, text: styles.statusPendingText };
            case 'reviewed':
                return { bg: styles.statusReviewed, text: styles.statusReviewedText };
            case 'accepted':
                return { bg: styles.statusAccepted, text: styles.statusAcceptedText };
            case 'rejected':
                return { bg: styles.statusRejected, text: styles.statusRejectedText };
            default:
                return { bg: styles.statusDefault, text: styles.statusDefaultText };
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'Në pritje',
            reviewed: 'Rishikuar',
            accepted: 'Pranuar',
            rejected: 'Refuzuar',
        };
        return statusMap[status] || status;
    };

    const renderApplicationCard = ({ item }: { item: ApplicationWithJob }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={[styles.applicationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.jobs.title}
                    </Text>
                    <View style={[styles.statusBadge, statusStyle.bg]}>
                        <Text style={[styles.statusText, statusStyle.text]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.jobInfo}>
                    <Text style={[styles.location, { color: colors.textSecondary }]}>{item.jobs.location}</Text>
                    <Text style={[styles.salary, { color: colors.textSecondary }]}>{item.jobs.salary}</Text>
                </View>

                <View style={styles.cardFooter}>
                    {item.message && (
                        <View style={[styles.messageContainer, { backgroundColor: isDark ? '#4B5563' : '#F3F4F6', borderColor: colors.border }]}>
                            <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Mesazhi nga punëdhënësi:</Text>
                            <Text style={[styles.messageText, { color: colors.text }]}>{item.message}</Text>
                        </View>
                    )}
                    <Text style={[styles.appliedDate, { color: colors.textSecondary }]}>
                        Aplikuar më: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Duke ngarkuar aplikimet...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Asnjë aplikim</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Filloni të aplikoni për punë për të parë aplikimet tuaja këtu
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderApplicationCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0ea5e9"
                        />
                    }
                />
            )}
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
    listContent: {
        padding: 16,
    },
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    jobTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 12,
        lineHeight: 28,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusPendingText: {
        color: '#92400E',
    },
    statusReviewed: {
        backgroundColor: '#DBEAFE',
    },
    statusReviewedText: {
        color: '#1E40AF',
    },
    statusAccepted: {
        backgroundColor: '#D1FAE5',
    },
    statusAcceptedText: {
        color: '#065F46',
    },
    statusRejected: {
        backgroundColor: '#FEE2E2',
    },
    statusRejectedText: {
        color: '#991B1B',
    },
    statusDefault: {
        backgroundColor: '#F3F4F6',
    },
    statusDefaultText: {
        color: '#6B7280',
    },
    jobInfo: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
    },
    location: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    salary: {
        fontSize: 15,
        color: '#0ea5e9',
        fontWeight: '700',
    },
    cardFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    appliedDate: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 26,
        maxWidth: 300,
    },
    messageContainer: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
    },
    messageLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageText: {
        fontSize: 15,
        color: '#334155',
        fontStyle: 'italic',
        lineHeight: 22,
    },
});
