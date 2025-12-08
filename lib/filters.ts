import { Job, JobType } from './supabase';

export interface FilterOptions {
    jobTypes: JobType[];
    locations: string[];
    sortBy: 'newest' | 'oldest' | 'salary';
}

/**
 * Filter jobs based on search query and filter options
 */
export function filterJobs(
    jobs: Job[],
    searchQuery: string,
    filters: FilterOptions
): Job[] {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(job =>
            job.title.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
        filtered = filtered.filter(job =>
            filters.jobTypes.includes(job.job_type)
        );
    }

    // Location filter
    if (filters.locations.length > 0) {
        filtered = filtered.filter(job =>
            filters.locations.some(location =>
                job.location.toLowerCase().includes(location.toLowerCase())
            )
        );
    }

    // Sort
    filtered.sort((a, b) => {
        switch (filters.sortBy) {
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'salary':
                // Extract numbers from salary string for comparison
                const salaryA = extractSalaryNumber(a.salary);
                const salaryB = extractSalaryNumber(b.salary);
                return salaryB - salaryA;
            default:
                return 0;
        }
    });

    return filtered;
}

/**
 * Extract numeric value from salary string
 * Examples: "€1000-1500" -> 1250, "€2000" -> 2000
 */
function extractSalaryNumber(salary: string): number {
    const numbers = salary.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;

    if (numbers.length === 1) {
        return parseInt(numbers[0]);
    }

    // If range, return average
    const min = parseInt(numbers[0]);
    const max = parseInt(numbers[1]);
    return (min + max) / 2;
}

/**
 * Get unique locations from jobs array
 */
export function getUniqueLocations(jobs: Job[]): string[] {
    const locations = jobs.map(job => job.location);
    return Array.from(new Set(locations)).sort();
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
