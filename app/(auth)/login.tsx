import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Animated,
} from 'react-native';
import { router } from 'expo-router';
import { signIn } from '@/lib/auth';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Ju lutem plotësoni të gjitha fushat');
            return;
        }

        setLoading(true);
        try {
            await signIn({ email, password });
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Email ose fjalëkalim i gabuar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Header with welcome message */}
            <View style={styles.header}>
                <Text style={styles.welcomeEmoji}>👋</Text>
                <Text style={styles.title}>Mirë se vini</Text>
                <Text style={styles.subtitle}>
                    Hyni në llogarinë tuaj për të vazhduar
                </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
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
                        placeholder="Shkruani fjalëkalimin"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.button, loading && styles.buttonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Hyni</Text>
                    )}
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Nuk keni llogari? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.link}>Regjistrohuni këtu</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
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
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    button: {
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 16,
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
    decorativeCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#DBEAFE',
        opacity: 0.3,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#FEF3C7',
        opacity: 0.3,
    },
});
