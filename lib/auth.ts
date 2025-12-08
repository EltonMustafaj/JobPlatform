import { supabase, UserRole } from './supabase';

export interface SignUpData {
    email: string;
    password: string;
    role: UserRole;
    fullName?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

/**
 * Sign up a new user with role selection
 */
export async function signUp({ email, password, role, fullName }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role,
                full_name: fullName || '',
            },
            // Skip email confirmation for development/testing
            // In production, you should enable email confirmation in Supabase dashboard
            emailRedirectTo: undefined,
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get the current user with their profile data
 */
export async function getCurrentUser() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) throw profileError;

    return { user, profile };
}

/**
 * Update user profile (generic)
 */
export async function updateProfile(userId: string, updates: any) {
    console.log('Updating profile for user:', userId);
    console.log('Updates:', updates);

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }

    console.log('Profile updated successfully:', data);
    return data;
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get company by employer ID
 */
export async function getCompany(employerId: string) {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('employer_id', employerId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
    }
    return data;
}

/**
 * Create or update company
 */
export async function upsertCompany(companyData: {
    employer_id: string;
    company_name: string;
    company_location?: string;
    company_phone?: string;
    company_description?: string;
    company_website?: string;
    industry?: string;
    employee_count?: string;
    founded_year?: string;
}) {
    console.log('Upserting company:', companyData);

    // Check if company exists
    const existing = await getCompany(companyData.employer_id);

    let result;
    if (existing) {
        // Update
        result = await supabase
            .from('companies')
            .update(companyData)
            .eq('employer_id', companyData.employer_id)
            .select()
            .single();
    } else {
        // Insert
        result = await supabase
            .from('companies')
            .insert([companyData])
            .select()
            .single();
    }

    if (result.error) {
        console.error('Error upserting company:', result.error);
        throw result.error;
    }

    console.log('Company upserted successfully:', result.data);
    return result.data;
}
