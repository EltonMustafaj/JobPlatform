import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { supabase, Job } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { subscribeToJobRefresh } from '@/lib/jobRefresh';

export default function PostedJobsScreen() {
    const [jobs, setJobs] = useState<Job[]>([]);
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
        loadMyJobs();
        
        // Subscribe për auto-refresh kur krijohet/updatohet një punë
        const unsubscribe = subscribeToJobRefresh(() => {
            loadMyJobs();
        });
        
        return () => unsubscribe();
    }, []);

    const loadMyJobs = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            // Load only jobs posted by current employer with company info
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('employer_id', userData.user.id)
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // Fetch company info separately
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('company_name, employer_id')
                .eq('employer_id', userData.user.id)
                .single();

            // Merge company data with jobs
            const enrichedJobs = jobsData?.map(job => ({
                ...job,
                company: companyData
            })) || [];
            
            console.log('Company data:', companyData);
            setJobs(enrichedJobs);
        } catch (error) {
            console.error('Error loading my jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMyJobs();
    };

    const renderJobCard = ({ item }: { item: any }) => {
        const companyName = item.company?.company_name || 'Kompania Juaj';
        
        return (
            <View
                style={[
                    styles.jobCard,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border }
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.push(`/job-details/${item.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.jobHeader}>
                        <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View
                            style={[
                                styles.statusBadge,
                                item.is_active ? styles.statusActive : styles.statusInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    item.is_active ? styles.statusTextActive : styles.statusTextInactive,
                                ]}
                            >
                                {item.is_active ? 'Aktive' : 'Joaktive'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.companyInfo}>
                        <Text style={[styles.companyLabel, { color: colors.textSecondary }]}>
                            🏢 {companyName}
                        </Text>
                    </View>

                    <View style={styles.jobInfo}>
                        <Text style={[styles.location, { color: colors.textSecondary }]}>
                            📍 {item.location}
                        </Text>
                        <Text style={[styles.salary, { color: colors.textSecondary }]}>
                            💰 {item.salary}
                        </Text>
                    </View>

                    <View style={[styles.jobFooter, { borderTopColor: colors.border }]}>
                        <Text style={[styles.deadline, { color: colors.textSecondary }]}>
                            Afati: {new Date(item.deadline).toLocaleDateString()}
                        </Text>
                        <View style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>Shiko Aplikantët</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Edit button */}
                <TouchableOpacity
                    onPress={() => router.push(`/edit-job/${item.id}`)}
                    style={styles.editButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.editButtonText}>✏️ Edito Punën</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Duke ngarkuar punët tuaja...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {jobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Asnjë punë e postuar ende
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Ju nuk keni postuar asnjë punë ende. Filloni të postoni punën tuaj të parë!
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/post-job')}
                        style={styles.emptyButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.emptyButtonText}>Posto Punë të Re</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJobCard}
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
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    listContent: {
        padding: 16,
    },
    jobCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
    },
    statusInactive: {
        backgroundColor: '#F3F4F6',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusTextActive: {
        color: '#065F46',
    },
    statusTextInactive: {
        color: '#6B7280',
    },
    companyInfo: {
        marginBottom: 8,
    },
    companyLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    jobInfo: {
        marginBottom: 12,
    },
    location: {
        fontSize: 14,
        marginBottom: 4,
    },
    salary: {
        fontSize: 15,
        fontWeight: '600',
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    deadline: {
        fontSize: 13,
        fontWeight: '600',
    },
    viewButton: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    viewButtonText: {
        color: '#0369a1',
        fontSize: 13,
        fontWeight: '700',
    },
    editButton: {
        marginTop: 12,
        backgroundColor: '#0ea5e9',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyEmoji: {
        fontSize: 72,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    emptyButton: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
