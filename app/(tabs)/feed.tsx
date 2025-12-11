import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase, Job } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/Theme';
import { getThemeColors } from '@/constants/Theme';
import { useInfiniteQuery } from '@tanstack/react-query';
import { sanitize } from '@/lib/sanitize';
import { subscribeToJobRefresh } from '@/lib/jobRefresh';

// New Components
import SearchBar from '@/components/SearchBar';
import FilterPanel, { FilterOptions } from '@/components/FilterPanel';
import { Card, Badge, EmptyState, ListSkeleton, Button } from '@/components/ui';

const ITEMS_PER_PAGE = 10;

export default function FeedScreen() {
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({
        jobTypes: [],
        locations: [],
        workModes: [],
        experienceLevels: [],
        salaryRange: null,
        datePosted: 'all',
        sortBy: 'newest',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [allLocations, setAllLocations] = useState<string[]>([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);

    // Fetch unique locations for filter
    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase
                .from('jobs')
                .select('location')
                .eq('is_active', true);

            if (data) {
                const unique = Array.from(new Set(data.map(j => j.location))).filter(Boolean);
                setAllLocations(unique);
            }
        };
        fetchLocations();
        
        // 🔄 Subscribe për auto-refresh kur krijohet/updatohet/fshihet një punë
        const unsubscribe = subscribeToJobRefresh(() => {
            jobsQuery.refetch();
        });
        
        return () => unsubscribe();
    }, []);

    // Load jobs with pagination and filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

    const fetchJobs = async ({ pageParam = 0 }): Promise<{ data: Job[]; count: number }> => {
        let query = supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .eq('is_active', true);

        if (debouncedQuery) {
            query = query.ilike('title', `%${debouncedQuery}%`);
        }
        if (filters.jobTypes.length > 0) {
            query = query.in('job_type', filters.jobTypes);
        }
        if (filters.locations.length > 0) {
            query = query.in('location', filters.locations);
        }
        if (filters.workModes.length > 0) {
            query = query.in('work_mode', filters.workModes);
        }
        if (filters.experienceLevels.length > 0) {
            query = query.in('experience_level', filters.experienceLevels);
        }
        if (filters.salaryRange) {
            // Show jobs where salary range overlaps with filter range
            // Job is included if: max_salary >= filter.min AND min_salary <= filter.max
            query = query
                .gte('max_salary', filters.salaryRange.min)
                .lte('min_salary', filters.salaryRange.max);
        }
        if (filters.datePosted !== 'all') {
            const now = new Date();
            const since = new Date(now);
            if (filters.datePosted === '24h') {
                since.setDate(now.getDate() - 1);
            } else if (filters.datePosted === 'week') {
                since.setDate(now.getDate() - 7);
            } else if (filters.datePosted === 'month') {
                since.setDate(now.getDate() - 30);
            }
            query = query.gte('created_at', since.toISOString());
        }

        // Apply sorting
        if (filters.sortBy === 'oldest') {
            query = query.order('created_at', { ascending: true });
        } else if (filters.sortBy === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else if (filters.sortBy === 'salary_high') {
            // Sort by max_salary first (high to low), then min_salary
            query = query
                .order('max_salary', { ascending: false, nullsLast: true })
                .order('min_salary', { ascending: false, nullsLast: true });
        } else if (filters.sortBy === 'salary_low') {
            // Sort by min_salary first (low to high), then max_salary
            query = query
                .order('min_salary', { ascending: true, nullsLast: true })
                .order('max_salary', { ascending: true, nullsLast: true });
        }

        const from = pageParam * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        const { data, error, count } = await query.range(from, to);

        if (error) throw error;
        return { data: data || [], count: count || 0 };
    };

    const jobsQuery = useInfiniteQuery({
        queryKey: ['jobs', debouncedQuery, filtersKey],
        queryFn: fetchJobs,
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            const loaded = pages.reduce((acc, page) => acc + page.data.length, 0);
            if (loaded < (lastPage.count || 0)) {
                return pages.length;
            }
            return undefined;
        },
    });

    const jobs = jobsQuery.data?.pages.flatMap(p => p.data) || [];
    const totalCount = jobsQuery.data?.pages?.[0]?.count || 0;
    const hasMore = jobsQuery.hasNextPage;

    const onRefresh = () => {
        jobsQuery.refetch();
    };

    const loadMore = () => {
        if (jobsQuery.hasNextPage && !jobsQuery.isFetchingNextPage) {
            jobsQuery.fetchNextPage();
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

    const renderHeader = () => (
        <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
            <View style={styles.searchRow}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Kerko pune, kompani..."
                        key="search-bar"
                    />
                </View>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        {
                            backgroundColor: showFilters ? Colors.primary[100] : colors.surface,
                            borderColor: showFilters ? Colors.primary[500] : colors.border
                        }
                    ]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name="options-outline" size={20} color={showFilters ? Colors.primary[500] : colors.text} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.filterPanelContainer}>
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        onClearAll={() => setFilters({ jobTypes: [], locations: [], workModes: [], experienceLevels: [], salaryRange: null, datePosted: 'all', sortBy: 'newest' })}
                        availableLocations={allLocations}
                    />
                </View>
            )}

            <View style={styles.resultsInfo}>
                <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                    {totalCount} {totalCount === 1 ? 'pune e gjetur' : 'pune te gjetura'}
                </Text>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!jobsQuery.isFetchingNextPage) return <View style={{ height: 20 }} />;

        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={Colors.primary[500]} />
            </View>
        );
    };

    const renderJobCard = ({ item }: { item: Job }) => {
        const safeDescription = sanitize(item.description || '');

        return (
        <TouchableOpacity
            onPress={() => router.push(`/job-details/${item.id}`)}
            activeOpacity={0.9}
            style={{ marginBottom: Spacing.md }}
        >
            <Card variant="elevated" padding="lg">
                <View style={styles.jobHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.location, { color: colors.textSecondary }]}>
                            {item.location}
                        </Text>
                    </View>
                    <Text style={styles.salary}>{item.salary}</Text>
                </View>

                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                    {safeDescription}
                </Text>

                <View style={styles.jobFooter}>
                    <Badge variant="info" size="sm">
                        {getJobTypeLabel(item.job_type)}
                    </Badge>
                    <Text style={[styles.deadline, { color: colors.textTertiary }]}>
                        ⏳ {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                </View>
            </Card>
        </TouchableOpacity>
        );
    };

    if (jobsQuery.isLoading && jobs.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, padding: Spacing.md }]}>
                <ListSkeleton count={4} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={jobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={jobsQuery.isRefetching}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary[500]}
                    />
                }
                windowSize={5}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
                removeClippedSubviews
                ListEmptyComponent={
                    jobsQuery.isLoading ? null : (
                        <EmptyState
                            title="Asnje pune e gjetur"
                            description="Provoni te ndryshoni filtrat ose kerkimin tuaj per te gjetur rezultate."
                            actionLabel="Pastro Filtrat"
                            onAction={() => {
                                setSearchQuery('');
                                setFilters({ jobTypes: [], locations: [], workModes: [], experienceLevels: [], salaryRange: null, datePosted: 'all', sortBy: 'newest' });
                            }}
                        />
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        padding: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    searchRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    filterPanelContainer: {
        marginTop: Spacing.sm,
    },
    resultsInfo: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    resultsText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    listContent: {
        padding: Spacing.md,
        paddingTop: 0,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    jobTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        marginBottom: 4,
    },
    location: {
        fontSize: FontSize.sm,
    },
    salary: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.primary[600],
        backgroundColor: Colors.primary[50],
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    description: {
        fontSize: FontSize.base,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[100],
    },
    deadline: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
});
