import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Animated,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCurrentUser, signOut, updateProfile, getCompany, upsertCompany } from '@/lib/auth';
import { pickImage, uploadProfilePhoto } from '@/lib/storage';
import { Profile, Company } from '@/lib/supabase';
import EditProfileModal from '@/components/EditProfileModal';
import EditCompanyModal from '@/components/EditCompanyModal';
import CVUploadModal from '@/components/CVUploadModal';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Theme';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showCVModal, setShowCVModal] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const { theme, setTheme, isDark } = useTheme();

    // Dynamic theme colors
    const colors = {
        background: isDark ? '#1F2937' : '#F9FAFB',
        cardBackground: isDark ? '#374151' : '#fff',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#D1D5DB' : '#6B7280',
        border: isDark ? '#4B5563' : '#E5E7EB',
        headerBg: isDark ? '#111827' : '#fff',
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleOpenLink = async (url: string) => {
        try {
            const cleanUrl = url.trim();
            const supported = await Linking.canOpenURL(cleanUrl);

            if (supported) {
                await Linking.openURL(cleanUrl);
            } else {
                Alert.alert('Error', 'Nuk mund te hapet ky link: ' + cleanUrl);
            }
        } catch (error) {
            console.error('Error opening link:', error);
            Alert.alert('Error', 'Ndodhi nje gabim gjate hapjes se linkut.');
        }
    };

    const loadProfile = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData?.profile) {
                setProfile(userData.profile);

                // Load company if employer
                if (userData.profile.role === 'employer') {
                    try {
                        const companyData = await getCompany(userData.profile.id);
                        if (companyData) setCompany(companyData);
                    } catch (error) {
                        console.log('No company found or error fetching company');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoto = async () => {
        try {
            const imageUri = await pickImage();
            if (!imageUri || !profile) return;

            setUploading(true);
            const photoUrl = await uploadProfilePhoto(profile.id, imageUri);
            await updateProfile(profile.id, { photo_url: photoUrl });
            setProfile({ ...profile, photo_url: photoUrl });
            Alert.alert('Sukses', 'Fotoja u ndryshua me sukses!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ndodhi nje gabim');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (updates: Partial<Profile>) => {
        if (!profile) return;
        try {
            const updatedProfile = await updateProfile(profile.id, updates);
            setProfile(updatedProfile);
            Alert.alert('Sukses', 'Profili u perditesua me sukses!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleUpdateCompany = async (companyData: Partial<Company>) => {
        if (!profile) return;
        try {
            const updatedCompany = await upsertCompany({
                employer_id: profile.id,
                company_name: companyData.company_name!,
                company_location: companyData.company_location || undefined,
                company_phone: companyData.company_phone || undefined,
                company_description: companyData.company_description || undefined,
                company_website: companyData.company_website || undefined,
                industry: companyData.industry || undefined,
                employee_count: companyData.employee_count || undefined,
                founded_year: companyData.founded_year || undefined,
            });
            setCompany(updatedCompany);
            Alert.alert('Sukses', 'Te dhenat e kompanise u ruajten!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Dilni', 'A jeni te sigurt qe deshironi te dilni?', [
            { text: 'Anulo', style: 'cancel' },
            {
                text: 'Dil',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace('/(auth)/login');
                    } catch (error: any) {
                        Alert.alert('Error', error.message);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>Profili nuk u gjet</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
                {/* Dark Mode Toggle - Top Right */}
                <TouchableOpacity 
                    style={[styles.darkModeToggle, isDark && styles.darkModeToggleActive]}
                    onPress={() => setTheme(isDark ? 'light' : 'dark')}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isDark ? 'moon' : 'moon-outline'} 
                        size={20} 
                        color={isDark ? '#fff' : '#6B7280'} 
                    />
                    <Text style={[styles.darkModeText, isDark && styles.darkModeTextActive]}>
                        {isDark ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>

                <Animated.View style={[styles.photoContainer, { transform: [{ scale: scaleAnim }] }]}>
                    {profile.photo_url ? (
                        <Image source={{ uri: profile.photo_url }} style={styles.profilePhoto} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoEmoji}>{profile.role === 'employer' ? 'E' : 'U'}</Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={handleChangePhoto} disabled={uploading} style={styles.cameraButton}>
                        {uploading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="camera" size={20} color="white" />}
                    </TouchableOpacity>
                </Animated.View>

                <Text style={[styles.name, { color: colors.text }]}>{profile.full_name || 'Perdorues'}</Text>
                {profile.role === 'job_seeker' && <Text style={[styles.email, { color: colors.textSecondary }]}>{profile.email}</Text>}

                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                        {profile.role === 'employer' ? 'Punedhenes' : 'Punekerkues'}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Job Seeker Section */}
                {profile.role === 'job_seeker' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Informacione Personale</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.editButton}>
                                <Text style={styles.editButtonText}>Edito</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.email}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Telefon</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.phone || 'Pa percaktuar'}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Adresa</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.address || 'Pa percaktuar'}</Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Edukimi & Eksperienca</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Eksperienca</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.experience || 'Shtoni eksperiencen tuaj'}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Edukimi</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.education || 'Shtoni edukimin tuaj'}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Aftesite</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{profile.skills || 'Shtoni aftesite tuaja'}</Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>CV-ja Juaj</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                            {profile.cv_url ? (
                                <View style={styles.cvContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cvText}>CV eshte shtuar</Text>
                                        <TouchableOpacity
                                            onPress={() => handleOpenLink(profile.cv_url!)}
                                            style={{ marginTop: 4 }}
                                        >
                                            <Text style={{ color: Colors.primary[500], textDecorationLine: 'underline' }}>
                                                Shiko CV-ne
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowCVModal(true)} style={styles.uploadButton}>
                                        <Text style={styles.uploadButtonText}>Ndrysho</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.cvContainer}>
                                    <Text style={styles.cvText}>Asnje CV e ngarkuar</Text>
                                    <TouchableOpacity onPress={() => setShowCVModal(true)} style={styles.uploadButton}>
                                        <Text style={styles.uploadButtonText}>Shto CV</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Employer Section */}
                {profile.role === 'employer' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profili i Kompanise</Text>
                            <TouchableOpacity onPress={() => setShowCompanyModal(true)} style={styles.editButton}>
                                <Text style={styles.editButtonText}>{company ? 'Edito' : 'Krijo'}</Text>
                            </TouchableOpacity>
                        </View>

                        {company ? (
                            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.companyName, { color: colors.text }]}>{company.company_name}</Text>
                                <Text style={[styles.companyLocation, { color: colors.textSecondary }]}>{company.company_location || 'Pa lokacion'}</Text>
                                {company.company_website && (
                                    <TouchableOpacity onPress={() => handleOpenLink(company.company_website!)}>
                                        <Text style={styles.companyLink}>{company.company_website}</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <View style={styles.row}>
                                    <View style={styles.halfCol}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Industria</Text>
                                        <Text style={[styles.value, { color: colors.text }]}>{company.industry || '-'}</Text>
                                    </View>
                                    <View style={styles.halfCol}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nr. Punonjesve</Text>
                                        <Text style={[styles.value, { color: colors.text }]}>{company.employee_count || '-'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <View style={styles.infoRow}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Viti i Themelimit</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{company.founded_year || '-'}</Text>
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <Text style={[styles.label, { color: colors.textSecondary }]}>Pershkrimi</Text>
                                <Text style={[styles.companyDescription, { color: colors.text }]}>
                                    {company.company_description || 'Asnje pershkrim i shtuar.'}
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.emptyState, { borderColor: colors.border }]}>
                                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                    Ju lutem krijoni profilin e kompanise per te postuar pune.
                                </Text>
                                <TouchableOpacity style={styles.createButton} onPress={() => setShowCompanyModal(true)}>
                                    <Text style={styles.createButtonText}>Krijo Profilin e Kompanise</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.8}>
                    <Text style={styles.signOutText}>Dil nga Llogaria</Text>
                </TouchableOpacity>
            </View>

            <EditProfileModal
                visible={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onSave={handleUpdateProfile}
                profile={profile}
            />

            <EditCompanyModal
                visible={showCompanyModal}
                onClose={() => setShowCompanyModal(false)}
                onSave={handleUpdateCompany}
                company={company}
            />

            {profile && (
                <CVUploadModal
                    visible={showCVModal}
                    onClose={() => setShowCVModal(false)}
                    onSuccess={(url) => {
                        setProfile({ ...profile, cv_url: url });
                        Alert.alert('Sukses', 'CV u perditesua me sukses!');
                    }}
                    userId={profile.id}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        color: '#6B7280',
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
    },
    darkModeToggle: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        zIndex: 10,
    },
    darkModeToggleActive: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    darkModeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
    },
    darkModeTextActive: {
        color: '#fff',
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profilePhoto: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: '#fff',
    },
    photoPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    photoEmoji: {
        fontSize: 56,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0ea5e9',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    cameraEmoji: {
        fontSize: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    roleBadgeText: {
        color: '#0369a1',
        fontWeight: '700',
        fontSize: 15,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    editButton: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    editButtonText: {
        color: '#0284C7',
        fontWeight: '600',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfCol: {
        flex: 1,
    },
    cvContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    cvText: {
        color: '#15803D',
        fontWeight: '600',
        fontSize: 15,
    },
    uploadButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#15803D',
    },
    uploadButtonText: {
        color: '#15803D',
        fontWeight: '600',
        fontSize: 13,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    companyLocation: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    companyLink: {
        fontSize: 16,
        color: '#0ea5e9',
        marginBottom: 16,
        textDecorationLine: 'underline',
    },
    companyDescription: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2FE',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    signOutText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },
});
