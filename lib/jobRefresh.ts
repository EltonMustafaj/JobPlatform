/**
 * 🚀 Job Refresh Manager - Refresh automatik për punët
 * 
 * Përdoret për të invaliduar cache dhe refresh lista e punëve 
 * pas operacioneve create, update, delete
 */

import { router } from 'expo-router';

// Event listeners për refresh
type RefreshListener = () => void | Promise<void>;
const refreshListeners = new Set<RefreshListener>();

/**
 * Subscribe për refresh events
 */
export function subscribeToJobRefresh(listener: RefreshListener) {
    refreshListeners.add(listener);
    return () => refreshListeners.delete(listener);
}

/**
 * Trigger refresh për të gjitha listat që janë subscribed
 */
export async function triggerJobRefresh() {
    console.log('🔄 Triggering job refresh...');
    const promises = Array.from(refreshListeners).map(listener => listener());
    await Promise.all(promises);
}

/**
 * Custom hook për job mutations me auto-refresh
 */
export function useJobMutations() {
    const handlePostJob = async (jobData: any, callback: () => Promise<void>) => {
        await callback();
        // Refresh të gjitha listat
        await triggerJobRefresh();
    };

    const handleUpdateJob = async (jobId: string, jobData: any, callback: () => Promise<void>) => {
        await callback();
        // Refresh të gjitha listat
        await triggerJobRefresh();
    };

    const handleDeleteJob = async (jobId: string, callback: () => Promise<void>) => {
        await callback();
        // Refresh të gjitha listat
        await triggerJobRefresh();
    };

    return {
        postJob: handlePostJob,
        updateJob: handleUpdateJob,
        deleteJob: handleDeleteJob,
    };
}

/**
 * Helper për optimistic updates
 * Updaton UI menjëherë, pastaj bën refresh nga serveri
 */
export function withOptimisticUpdate<T>(
    optimisticUpdate: () => void,
    serverUpdate: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void
) {
    return async () => {
        try {
            // Update UI menjëherë (optimistic)
            optimisticUpdate();

            // Bëj update në server
            const result = await serverUpdate();

            // Refresh të gjitha listat nga serveri
            await triggerJobRefresh();

            // Callback për sukses
            onSuccess?.(result);

            return result;
        } catch (error) {
            // Nëse ka error, refresh për të kthyer state-in e mëparshëm
            await triggerJobRefresh();
            onError?.(error);
            throw error;
        }
    };
}
