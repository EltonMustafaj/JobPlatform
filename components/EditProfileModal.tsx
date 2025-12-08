import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Profile } from '@/lib/supabase';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Profile>) => Promise<void>;
    profile: Profile;
}

export default function EditProfileModal({ visible, onClose, onSave, profile }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [address, setAddress] = useState(profile.address || '');
    const [experience, setExperience] = useState(profile.experience || '');
    const [education, setEducation] = useState(profile.education || '');
    const [skills, setSkills] = useState(profile.skills || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            await onSave({
                full_name: fullName,
                phone,
                address,
                experience,
                education,
                skills,
            });
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Edito Profilin</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Anulo</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Emri i Plotë</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Emri juaj"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Numri i Telefonit</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+383 44 123 456"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Adresa</Text>
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Qyteti, Shteti"
                        />
                    </View>

                    <View style={styles.sectionDivider}>
                        <Text style={styles.sectionTitle}>Eksperienca & Edukimi</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Përvoja e Punës</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={experience}
                            onChangeText={setExperience}
                            placeholder="Përshkruani përvojën tuaj..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Edukimi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={education}
                            onChangeText={setEducation}
                            placeholder="Universiteti, Shkolla..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Aftësitë (Skills)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={skills}
                            onChangeText={setSkills}
                            placeholder="React, Node.js, Python..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Ruaj Ndryshimet</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: '#6B7280',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        minHeight: 100,
    },
    sectionDivider: {
        marginTop: 8,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0ea5e9',
    },
    footer: {
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#0ea5e9',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
