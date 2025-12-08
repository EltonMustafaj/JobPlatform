import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { pickDocument, uploadCV } from '@/lib/storage';

interface EasyApplyModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (cvUrl: string | null, isQuickApply?: boolean) => void;
    jobTitle: string;
}

export default function EasyApplyModal({ visible, onClose, onApply, jobTitle }: EasyApplyModalProps) {
    const { isDark } = useTheme();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingCV, setUploadingCV] = useState(false);

    const colors = {
        background: isDark ? '#1F2937' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        cardBg: isDark ? '#374151' : '#F9FAFB',
    };

    useEffect(() => {
        if (visible) {
            loadUserProfile();
        }
    }, [visible]);

    const loadUserProfile = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData?.profile) {
                setUserProfile(userData.profile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleQuickApply = () => {
        if (!userProfile?.default_cv_url) {
            Alert.alert(
                'CV Mungon',
                'Ju nuk keni një CV default. Ju lutem ngarkoni një CV ose zgjidhni një opsion tjetër.',
                [{ text: 'OK' }]
            );
            return;
        }
        onApply(userProfile.default_cv_url, true);
        onClose();
    };

    const handleApplyWithProfile = () => {
        onApply(null);
        onClose();
    };

    const handleApplyWithExistingCV = () => {
        if (userProfile?.cv_url) {
            onApply(userProfile.cv_url);
            onClose();
        }
    };

    const handleUploadNewCV = async (setAsDefault: boolean = false) => {
        const cvUri = await pickDocument();
        if (!cvUri) return;

        setUploadingCV(true);
        try {
            const userData = await getCurrentUser();
            if (!userData?.user) throw new Error('User not found');

            const cvUrl = await uploadCV(userData.user.id, cvUri);

            // If user wants to set as default
            if (setAsDefault) {
                await supabase
                    .from('profiles')
                    .update({ default_cv_url: cvUrl, cv_url: cvUrl })
                    .eq('id', userData.user.id);
            }

            onApply(cvUrl);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi një gabim');
        } finally {
            setUploadingCV(false);
        }
    };

    const handleSetDefaultCV = async () => {
        if (!userProfile?.cv_url) {
            Alert.alert('Info', 'Ju nuk keni një CV të ngarkuar në profil');
            return;
        }

        try {
            const userData = await getCurrentUser();
            if (!userData?.user) return;

            await supabase
                .from('profiles')
                .update({ default_cv_url: userProfile.cv_url })
                .eq('id', userData.user.id);

            Alert.alert('Sukses', 'CV-ja u vendos si default për Easy Apply');
            setUserProfile({ ...userProfile, default_cv_url: userProfile.cv_url });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi një gabim');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Apliko për Punë
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>
                        {jobTitle}
                    </Text>

                    <View style={styles.optionsContainer}>
                        {/* Quick Apply with Default CV */}
                        {userProfile?.default_cv_url ? (
                            <TouchableOpacity
                                style={[styles.optionButton, styles.quickApplyButton]}
                                onPress={handleQuickApply}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                    <Ionicons name="flash" size={24} color="#0EA5E9" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <View style={styles.titleRow}>
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>
                                            ⚡ Easy Apply (1-Klik)
                                        </Text>
                                        <View style={styles.recommendedBadge}>
                                            <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                        Apliko me CV-në default
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#0EA5E9" />
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.noDefaultCV, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                                <Text style={[styles.noDefaultText, { color: colors.textSecondary }]}>
                                    Vendosni një CV default për Easy Apply
                                </Text>
                                {userProfile?.cv_url && (
                                    <TouchableOpacity onPress={handleSetDefaultCV}>
                                        <Text style={styles.setDefaultLink}>Vendose tani</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Profile Only */}
                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                            onPress={handleApplyWithProfile}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                                <Ionicons name="person" size={24} color="#0284C7" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    Vetëm me Profil
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    Përdor të dhënat nga profili
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {/* Existing CV */}
                        {userProfile?.cv_url && (
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                                onPress={handleApplyWithExistingCV}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="document-text" size={24} color="#16A34A" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={[styles.optionTitle, { color: colors.text }]}>
                                        Me CV ekzistuese
                                    </Text>
                                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                        Përdor CV-në e ngarkuar në profil
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}

                        {/* Upload New CV */}
                        <TouchableOpacity
                            style={[styles.optionButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                            onPress={() => {
                                Alert.alert(
                                    'Ngarko CV të Re',
                                    'Dëshironi ta vendosni si CV default për Easy Apply?',
                                    [
                                        {
                                            text: 'Jo, vetëm ngarko',
                                            onPress: () => handleUploadNewCV(false)
                                        },
                                        {
                                            text: 'Po, vendose si default',
                                            onPress: () => handleUploadNewCV(true)
                                        },
                                        { text: 'Anulo', style: 'cancel' }
                                    ]
                                );
                            }}
                            disabled={uploadingCV}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="cloud-upload" size={24} color="#D97706" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {uploadingCV ? 'Duke ngarkuar...' : 'Ngarko CV të Re'}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    Zgjidh një dokument nga pajisja
                                </Text>
                            </View>
                            {uploadingCV ? (
                                <ActivityIndicator size="small" color="#D97706" />
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    jobTitle: {
        fontSize: 14,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    quickApplyButton: {
        backgroundColor: '#EFF6FF',
        borderColor: '#0EA5E9',
        borderWidth: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
    },
    recommendedBadge: {
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    recommendedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    noDefaultCV: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        marginBottom: 8,
    },
    noDefaultText: {
        flex: 1,
        fontSize: 13,
    },
    setDefaultLink: {
        color: '#0EA5E9',
        fontSize: 13,
        fontWeight: '600',
    },
});
