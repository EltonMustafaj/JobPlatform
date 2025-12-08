import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Animated,
} from 'react-native';
import { router } from 'expo-router';
import { signUp } from '@/lib/auth';
import { UserRole } from '@/lib/supabase';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handleRegister = async () => {
        if (!email || !password || !selectedRole) {
            Alert.alert('Error', 'Ju lutem plotësoni të gjitha fushat dhe zgjidhni rolin');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Fjalëkalimi duhet të jetë të paktën 6 karaktere');
            return;
        }

        setLoading(true);
        try {
            await signUp({
                email,
                password,
                role: selectedRole,
                fullName,
            });

            Alert.alert(
                'Sukses',
                'Llogaria u krijua me sukses! Ju lutem kontrolloni emailin tuaj për verifikim.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi një gabim gjatë regjistrimit');
        } finally {
            setLoading(false);
        }
    };

    const handleRolePress = (role: UserRole) => {
        setSelectedRole(role);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header with gradient effect */}
                <View style={styles.header}>
                    <Text style={styles.welcomeEmoji}>🚀</Text>
                    <Text style={styles.title}>Krijo Llogari</Text>
                    <Text style={styles.subtitle}>
                        Filloni udhëtimin tuaj në platformën e punës
                    </Text>
                </View>

                {/* Role Selection with cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Zgjidhni Rolin Tuaj</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            onPress={() => handleRolePress('employer')}
                            activeOpacity={0.8}
                            style={[
                                styles.roleButton,
                                selectedRole === 'employer' && styles.roleButtonSelected,
                            ]}
                        >
                            <View style={[
                                styles.roleIconContainer,
                                selectedRole === 'employer' && styles.roleIconContainerSelected
                            ]}>
                                <Text style={styles.roleEmoji}>💼</Text>
                            </View>
                            <Text
                                style={[
                                    styles.roleText,
                                    selectedRole === 'employer' && styles.roleTextSelected,
                                ]}
                            >
                                Punëdhënës
                            </Text>
                            <Text style={styles.roleSubtext}>Posto punë dhe gjej talent</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleRolePress('job_seeker')}
                            activeOpacity={0.8}
                            style={[
                                styles.roleButton,
                                selectedRole === 'job_seeker' && styles.roleButtonSelected,
                            ]}
                        >
                            <View style={[
                                styles.roleIconContainer,
                                selectedRole === 'job_seeker' && styles.roleIconContainerSelected
                            ]}>
                                <Text style={styles.roleEmoji}>🔍</Text>
                            </View>
                            <Text
                                style={[
                                    styles.roleText,
                                    selectedRole === 'job_seeker' && styles.roleTextSelected,
                                ]}
                            >
                                Punëkërkues
                            </Text>
                            <Text style={styles.roleSubtext}>Gjej punën e ëndrrave</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields with modern design */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>👤 Emri i Plotë</Text>
                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Shkruani emrin tuaj"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>📧 Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@example.com"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>🔒 Fjalëkalimi</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Të paktën 6 karaktere"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                {/* Register Button with gradient effect */}
                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.button, loading && styles.buttonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Regjistrohu</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Keni një llogari? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.link}>Hyni këtu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    welcomeEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roleButtonSelected: {
        borderColor: '#0ea5e9',
        backgroundColor: '#f0f9ff',
        shadowColor: '#0ea5e9',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    roleIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    roleIconContainerSelected: {
        backgroundColor: '#DBEAFE',
    },
    roleEmoji: {
        fontSize: 32,
    },
    roleText: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#374151',
        marginBottom: 4,
    },
    roleTextSelected: {
        color: '#0369a1',
    },
    roleSubtext: {
        textAlign: 'center',
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    button: {
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#7dd3fc',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 17,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 15,
    },
    link: {
        color: '#0ea5e9',
        fontWeight: '700',
        fontSize: 15,
    },
});
