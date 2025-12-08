import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Database types
export type UserRole = 'employer' | 'job_seeker';

export type Profile = {
    id: string;
    email: string;
    role: UserRole;
    full_name: string | null;
    photo_url: string | null;
    headline: string | null;
    // Job seeker fields
    experience: string | null;
    education: string | null;
    skills: string | null;
    cv_url: string | null;
    default_cv_url: string | null; // NEW: Default CV for Easy Apply
    phone: string | null;
    address: string | null;
    created_at: string;
};

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type Job = {
    id: string;
    employer_id: string;
    title: string;
    description: string;
    location: string;
    salary: string;
    job_type: JobType;
    work_mode: 'remote' | 'hybrid' | 'onsite' | null; // NEW: Work mode filter
    experience_level: 'entry' | 'mid' | 'senior' | 'executive' | null; // NEW: Experience level
    min_salary: number | null; // NEW: Salary range
    max_salary: number | null; // NEW: Salary range
    salary_currency: string | null; // NEW: Currency (EUR, USD, etc)
    deadline: string;
    is_active: boolean;
    created_at: string;
};

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export type Application = {
    id: string;
    job_id: string;
    applicant_id: string;
    cv_url: string | null; // Now optional
    status: ApplicationStatus;
    created_at: string;
    message: string | null;
    viewed_at: string | null; // NEW: When employer viewed the application
    viewed_by: string | null; // NEW: Who viewed the application
};

export type Company = {
    id: string;
    employer_id: string;
    company_name: string;
    company_location: string | null;
    company_phone: string | null;
    company_description: string | null;
    company_website: string | null;
    industry: string | null;
    employee_count: string | null;
    founded_year: string | null;
    created_at: string;
};
