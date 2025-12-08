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

export default function MyJobsScreen() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            setCurrentUserId(userData.user.id);

            // Check if user is employer
            if (userData.profile?.role === 'employer') {
                // Employers see ALL jobs from all employers
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*, profiles!jobs_employer_id_fkey(full_name, email)')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setJobs(data || []);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const renderJobCard = ({ item }: { item: any }) => {
        const isOwner = currentUserId === item.employer_id;
        const employerName = item.profiles?.full_name || item.profiles?.email || 'Punëdhënës';
        
        const CardContent = () => (
            <>
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

                {/* Show employer name if not owner */}
                {!isOwner && (
                    <View style={styles.employerInfo}>
                        <Text style={[styles.employerLabel, { color: colors.textSecondary }]}>
                            Postuar nga: <Text style={styles.employerName}>{employerName}</Text>
                        </Text>
                    </View>
                )}

                <View style={styles.jobInfo}>
                    <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>
                    <Text style={[styles.salary, { color: colors.textSecondary }]}>{item.salary}</Text>
                </View>

                <View style={[styles.jobFooter, { borderTopColor: colors.border }]}>
                    <Text style={[styles.deadline, { color: colors.textSecondary }]}>
                        Afati: {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                    {isOwner && (
                        <View style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>Shiko Aplikantët</Text>
                        </View>
                    )}
                </View>
            </>
        );
        
        return (
            <View
                style={[
                    styles.jobCard, 
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    !isOwner && styles.jobCardDisabled
                ]}
            >
                {isOwner ? (
                    <TouchableOpacity
                        onPress={() => router.push(`/job-details/${item.id}`)}
                        activeOpacity={0.7}
                    >
                        <CardContent />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.nonClickableCard}>
                        <CardContent />
                        <View style={styles.lockOverlay}>
                            <Text style={styles.lockText}>🔒 Punë e punëdhënësit tjetër</Text>
                        </View>
                    </View>
                )}

                {/* Show Edit button only for owner's jobs */}
                {isOwner && (
                    <TouchableOpacity
                        onPress={() => router.push(`/edit-job/${item.id}`)}
                        style={styles.editButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.editButtonText}>✏️ Edito Punën</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Duke ngarkuar punët tuaja...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {jobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Asnjë punë e gjetur</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Nuk ka punë të postuara ende
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
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
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
        color: '#111827',
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
    jobInfo: {
        marginBottom: 12,
    },
    location: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    salary: {
        fontSize: 15,
        color: '#0ea5e9',
        fontWeight: '600',
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    deadline: {
        fontSize: 13,
        color: '#6B7280',
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
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
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
    employerInfo: {
        marginBottom: 8,
    },
    employerLabel: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    employerName: {
        fontWeight: '600',
        fontStyle: 'normal',
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
    jobCardDisabled: {
        opacity: 0.6,
    },
    nonClickableCard: {
        position: 'relative',
    },
    lockOverlay: {
        marginTop: 8,
        backgroundColor: '#FEF3C7',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    lockText: {
        color: '#92400E',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});
