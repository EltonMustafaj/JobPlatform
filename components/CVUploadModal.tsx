import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Theme';
import { Input, Button } from './ui';
import { pickDocument, uploadCV } from '@/lib/storage';
import { updateProfile } from '@/lib/auth';

interface CVUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (url: string) => void;
    userId: string;
}

export default function CVUploadModal({ visible, onClose, onSuccess, userId }: CVUploadModalProps) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
    const [mode, setMode] = useState<'select' | 'link'>('select');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFilePick = async () => {
        try {
            setLoading(true);
            const docUri = await pickDocument();
            if (!docUri) {
                setLoading(false);
                return;
            }

            const cvUrl = await uploadCV(userId, docUri);
            await updateProfile(userId, { cv_url: cvUrl });
            onSuccess(cvUrl);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi një gabim gjatë ngarkimit të CV-së');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSubmit = async () => {
        if (!link.trim()) {
            Alert.alert('Error', 'Ju lutem shkruani një link');
            return;
        }

        // Basic URL validation
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            Alert.alert('Error', 'Linku duhet të fillojë me http:// ose https://');
            return;
        }

        try {
            setLoading(true);
            await updateProfile(userId, { cv_url: link });
            onSuccess(link);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi një gabim gjatë ruajtjes së linkut');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setMode('select');
        setLink('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={resetAndClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {mode === 'select' ? 'Ngarko CV' : 'Vendos Link'}
                        </Text>
                        <TouchableOpacity onPress={resetAndClose}>
                            <Text style={[styles.closeText, { color: colors.textSecondary }]}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'select' ? (
                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.surfaceVariant }]}
                                onPress={handleFilePick}
                                disabled={loading}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Ngarko Dokument</Text>
                                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>PDF, DOC, DOCX</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.surfaceVariant }]}
                                onPress={() => setMode('link')}
                                disabled={loading}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Vendos Link</Text>
                                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>LinkedIn, Drive, Portfolio</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.linkContainer}>
                            <Input
                                label="Linku i CV-së"
                                placeholder="https://linkedin.com/in/..."
                                value={link}
                                onChangeText={setLink}
                                autoCapitalize="none"
                                icon="link"
                            />
                            <View style={styles.actions}>
                                <Button
                                    variant="outline"
                                    onPress={() => setMode('select')}
                                    style={{ flex: 1 }}
                                >
                                    Kthehu
                                </Button>
                                <Button
                                    variant="primary"
                                    onPress={handleLinkSubmit}
                                    loading={loading}
                                    style={{ flex: 1 }}
                                >
                                    Ruaj
                                </Button>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.xl,
        minHeight: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    closeText: {
        fontSize: FontSize.xl,
        padding: Spacing.xs,
    },
    optionsContainer: {
        gap: Spacing.md,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    optionEmoji: {
        fontSize: 24,
    },
    optionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        flex: 1,
    },
    optionDesc: {
        fontSize: FontSize.sm,
    },
    linkContainer: {
        gap: Spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
});
