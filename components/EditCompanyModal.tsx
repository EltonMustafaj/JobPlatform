import React, { useState, useEffect } from 'react';
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
import { Company } from '@/lib/supabase';
import { normalizeUrl } from '@/lib/sanitize';

interface EditCompanyModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (companyData: Partial<Company>) => Promise<void>;
    company: Company | null;
}

export default function EditCompanyModal({ visible, onClose, onSave, company }: EditCompanyModalProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [industry, setIndustry] = useState('');
    const [employeeCount, setEmployeeCount] = useState('');
    const [foundedYear, setFoundedYear] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (company) {
            setName(company.company_name || '');
            setLocation(company.company_location || '');
            setPhone(company.company_phone || '');
            setWebsite(company.company_website || '');
            setIndustry(company.industry || '');
            setEmployeeCount(company.employee_count || '');
            setFoundedYear(company.founded_year || '');
            setDescription(company.company_description || '');
        }
    }, [company]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Emri i kompanisë është i detyrueshëm');
            return;
        }

        try {
            setLoading(true);
            const sanitizedWebsite = normalizeUrl(website);
            await onSave({
                company_name: name,
                company_location: location,
                company_phone: phone,
                company_website: sanitizedWebsite,
                industry: industry,
                employee_count: employeeCount,
                founded_year: foundedYear,
                company_description: description,
            });
            onClose();
        } catch (error) {
            console.error('Error saving company:', error);
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
                    <Text style={styles.title}>
                        {company ? 'Edito Kompaninë' : 'Krijo Kompaninë'}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Anulo</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Emri i Kompanisë *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Emri i kompanisë suaj"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Lokacioni</Text>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Adresa e kompanisë"
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
                        <Text style={styles.label}>Website</Text>
                        <TextInput
                            style={styles.input}
                            value={website}
                            onChangeText={setWebsite}
                            placeholder="https://www.example.com"
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Industria</Text>
                            <TextInput
                                style={styles.input}
                                value={industry}
                                onChangeText={setIndustry}
                                placeholder="p.sh. IT, Ndërtim"
                            />
                        </View>
                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Nr. Punonjësve</Text>
                            <TextInput
                                style={styles.input}
                                value={employeeCount}
                                onChangeText={setEmployeeCount}
                                placeholder="p.sh. 10-50"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Viti i Themelimit</Text>
                        <TextInput
                            style={styles.input}
                            value={foundedYear}
                            onChangeText={setFoundedYear}
                            placeholder="p.sh. 2015"
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Përshkrimi i Kompanisë</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Përshkruani kompaninë tuaj..."
                            multiline
                            numberOfLines={4}
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
                                <Text style={styles.saveButtonText}>Ruaj Të Dhënat</Text>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
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
