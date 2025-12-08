import { supabase } from './supabase';

/**
 * Check if a job is saved by the current user
 */
export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('job_id', jobId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking saved job:', error);
        return false;
    }
}

/**
 * Save a job for the current user
 */
export async function saveJob(userId: string, jobId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('saved_jobs')
            .insert({
                user_id: userId,
                job_id: jobId,
            });

        if (error) throw error;
        return true;
    } catch (error: any) {
        // Duplicate entry - already saved
        if (error.code === '23505') {
            return true;
        }
        console.error('Error saving job:', error);
        return false;
    }
}

/**
 * Unsave a job for the current user
 */
export async function unsaveJob(userId: string, jobId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', userId)
            .eq('job_id', jobId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error unsaving job:', error);
        return false;
    }
}

/**
 * Toggle save status for a job
 */
export async function toggleSaveJob(userId: string, jobId: string): Promise<boolean> {
    const isSaved = await isJobSaved(userId, jobId);
    
    if (isSaved) {
        return await unsaveJob(userId, jobId);
    } else {
        return await saveJob(userId, jobId);
    }
}

/**
 * Get all saved jobs for a user with job details
 */
export async function getSavedJobs(userId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select(`
                id,
                job_id,
                created_at,
                job:jobs(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting saved jobs:', error);
        return [];
    }
}

/**
 * Get count of saved jobs for a user
 */
export async function getSavedJobsCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('saved_jobs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error getting saved jobs count:', error);
        return 0;
    }
}
