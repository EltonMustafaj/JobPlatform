import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from './supabase';

const MAX_PROFILE_PHOTO_BYTES = 500 * 1024; // 500KB
const MAX_CV_BYTES = 2 * 1024 * 1024; // 2MB
const IMAGE_ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const CV_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const CV_ALLOWED_EXT = ['pdf', 'doc', 'docx'];


/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(userId: string, fileUri: string) {
    try {
        console.log('Preparing file for upload...');

        // Generate unique filename
        const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
        if (!IMAGE_ALLOWED_EXT.includes(fileExt)) {
            throw new Error('Lejohen vetem formatet e imazhit (jpg, jpeg, png, webp)');
        }
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        console.log('Uploading to:', fileName);

        // Read file as ArrayBuffer (React Native compatible)
        const response = await fetch(fileUri);
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength > MAX_PROFILE_PHOTO_BYTES) {
            throw new Error('Fotoja duhet te jete me e vogel se 500KB');
        }

        console.log('Uploading file...');

        // Upload the ArrayBuffer
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, arrayBuffer, {
                contentType: `image/${fileExt}`,
                upsert: true,
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }
        console.log('Upload successful:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

        console.log('Public URL:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
}

/**
 * Upload CV to Supabase Storage
 */
export async function uploadCV(userId: string, fileUri: string) {
    try {
        // Generate unique filename
        const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'pdf';
        if (!CV_ALLOWED_EXT.includes(fileExt)) {
            throw new Error('Lejohen vetem PDF, DOC, ose DOCX');
        }
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // Read file as ArrayBuffer (React Native compatible)
        const response = await fetch(fileUri);
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength > MAX_CV_BYTES) {
            throw new Error('CV duhet te jete me e vogel se 2MB');
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('cvs')
            .upload(fileName, arrayBuffer, {
                contentType: CV_MIME_TYPES.find(type => type.includes(fileExt)) || 'application/pdf',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading CV:', error);
        throw error;
    }
}

/**
 * Pick an image from the device
 */
export async function pickImage() {
    try {
        // Request permission first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            throw new Error('Na duhet leja për të aksesuar galerinë tuaj të fotove.');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.fileSize && asset.fileSize > MAX_PROFILE_PHOTO_BYTES) {
                throw new Error('Fotoja duhet te jete me e vogel se 500KB');
            }
            return asset.uri;
        }

        return null;
    } catch (error) {
        console.error('Error picking image:', error);
        throw error;
    }
}

/**
 * Pick a document (CV) from the device
 */
export async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
        type: CV_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
    });

    if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileExt = asset.name?.split('.').pop()?.toLowerCase();
        if (fileExt && !CV_ALLOWED_EXT.includes(fileExt)) {
            throw new Error('Lejohen vetem PDF, DOC, ose DOCX');
        }
        if (asset.size && asset.size > MAX_CV_BYTES) {
            throw new Error('CV duhet te jete me e vogel se 2MB');
        }
        return asset.uri;
    }

    return null;
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
}
