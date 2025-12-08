# Job Platform - React Native + Expo + Supabase

A mobile job platform application built with React Native, Expo, and Supabase, featuring role-based access for employers and job seekers.

## Features

### For Employers 💼
- Post new job listings with detailed information
- View all posted jobs
- See applicants for each job
- Download applicant CVs

### For Job Seekers 🔍
- Browse all active job listings
- View detailed job information
- Apply for jobs with CV upload
- Track application status
- View application history

### General Features
- User authentication with role selection (Employer/Job Seeker)
- Profile management with photo upload
- Role-based navigation
- Modern, responsive UI with NativeWind (Tailwind CSS)

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Supabase account

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd JobPlatform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   The `.env` file is already created with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://opkbkkkonqhnwmqwkbav.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Set up Supabase Database**:
   
   **IMPORTANT**: You must run the SQL migration script to create the database schema.
   
   a. Go to your Supabase project dashboard
   b. Navigate to the SQL Editor
   c. Open the file `supabase/migrations/001_initial_schema.sql`
   d. Copy the entire SQL script
   e. Paste it into the Supabase SQL Editor
   f. Click "Run" to execute the script
   
   This will create:
   - `profiles` table (user profiles with roles)
   - `jobs` table (job listings)
   - `applications` table (job applications)
   - Storage buckets for profile photos and CVs
   - Row Level Security (RLS) policies
   - Automatic profile creation trigger

## Running the App

1. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

2. **Run on your device**:
   - Install the "Expo Go" app on your iOS or Android device
   - Scan the QR code shown in the terminal with your camera (iOS) or Expo Go app (Android)
   - The app will load on your device

3. **Run on simulator/emulator** (optional):
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator

## Project Structure

```
JobPlatform/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── feed.tsx         # Job feed (job seekers)
│   │   ├── my-applications.tsx
│   │   ├── my-jobs.tsx      # Posted jobs (employers)
│   │   ├── post-job.tsx     # Post new job (employers)
│   │   └── profile.tsx
│   ├── job-details/         # Job details screen
│   │   └── [jobId].tsx
│   └── _layout.tsx          # Root layout with auth
├── lib/
│   ├── supabase.ts          # Supabase client & types
│   ├── auth.ts              # Authentication functions
│   └── storage.ts           # File upload functions
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env                     # Environment variables
└── tailwind.config.js       # Tailwind configuration
```

## User Flow

### Registration
1. Open the app
2. Tap "Regjistrohuni" (Register)
3. Choose your role: **Punëdhënës** (Employer) or **Punëkërkues** (Job Seeker)
4. Fill in your details (name, email, password)
5. Submit registration

### For Employers
1. After login, you'll see three tabs:
   - **Punët e Mia** (My Jobs): View your posted jobs
   - **Posto Punë** (Post Job): Create new job listings
   - **Profili** (Profile): Manage your profile

2. To post a job:
   - Go to "Posto Punë" tab
   - Fill in job details (title, description, location, salary, type, deadline)
   - Tap "Publiko Punën" (Publish Job)

3. To view applicants:
   - Go to "Punët e Mia" tab
   - Tap on a job to see applicants
   - View applicant details and download CVs

### For Job Seekers
1. After login, you'll see three tabs:
   - **Punë** (Jobs): Browse all available jobs
   - **Aplikimet** (Applications): View your applications
   - **Profili** (Profile): Manage your profile

2. To apply for a job:
   - Browse jobs in the "Punë" tab
   - Tap on a job to view details
   - Tap "Apliko për këtë Punë" (Apply for this Job)
   - Select your CV file (PDF)
   - Application is submitted

3. Track applications:
   - Go to "Aplikimet" tab
   - See all your applications with status indicators

## Database Schema

### profiles
- `id` (UUID): User ID (references auth.users)
- `email` (TEXT): User email
- `role` (TEXT): 'employer' or 'job_seeker'
- `full_name` (TEXT): User's full name
- `photo_url` (TEXT): Profile photo URL
- `created_at` (TIMESTAMP): Account creation date

### jobs
- `id` (UUID): Job ID
- `employer_id` (UUID): References profiles(id)
- `title` (TEXT): Job title
- `description` (TEXT): Job description
- `location` (TEXT): Job location
- `salary` (TEXT): Salary information
- `job_type` (TEXT): 'full-time', 'part-time', 'contract', 'internship'
- `deadline` (DATE): Application deadline
- `is_active` (BOOLEAN): Job status
- `created_at` (TIMESTAMP): Post date

### applications
- `id` (UUID): Application ID
- `job_id` (UUID): References jobs(id)
- `applicant_id` (UUID): References profiles(id)
- `cv_url` (TEXT): CV file URL
- `status` (TEXT): 'pending', 'reviewed', 'accepted', 'rejected'
- `created_at` (TIMESTAMP): Application date
- UNIQUE constraint on (job_id, applicant_id)

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only:
  - View their own profile and update it
  - Employers can create/update/delete their own jobs
  - Job seekers can apply to jobs and view their applications
  - Employers can view applications for their jobs
- Storage buckets have policies to protect user data

## Troubleshooting

### "Profile or Role not found" error
- Make sure you ran the SQL migration script in Supabase
- The trigger should automatically create a profile when a user signs up

### Images/CVs not uploading
- Check that the storage buckets were created by the migration script
- Verify the RLS policies are in place

### App won't start
- Make sure all dependencies are installed: `npm install`
- Clear Expo cache: `npx expo start -c`

## License

This project is created for educational purposes.
