import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isJobSaved, toggleSaveJob } from '@/lib/savedJobs';
import { getCurrentUser } from '@/lib/auth';

interface BookmarkButtonProps {
    jobId: string;
    size?: number;
    onToggle?: (isSaved: boolean) => void;
}

export default function BookmarkButton({ jobId, size = 24, onToggle }: BookmarkButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkSavedStatus();
    }, [jobId]);

    const checkSavedStatus = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            const saved = await isJobSaved(userData.user.id, jobId);
            setIsSaved(saved);
        } catch (error) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleToggle = async () => {
        if (loading) return;

        try {
            setLoading(true);
            const userData = await getCurrentUser();
            if (!userData?.user) {
                Alert.alert('Kujdes', 'Ju duhet të jeni të kyçur për të ruajtur punë');
                return;
            }

            const success = await toggleSaveJob(userData.user.id, jobId);
            if (success) {
                const newSavedStatus = !isSaved;
                setIsSaved(newSavedStatus);
                onToggle?.(newSavedStatus);
            }
        } catch (error) {
            Alert.alert('Error', 'Ndodhi një gabim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleToggle}
            disabled={loading}
            style={styles.button}
            accessibilityLabel="bookmark icon"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={size}
                color={isSaved ? '#F59E0B' : '#9CA3AF'}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 4,
    },
});
