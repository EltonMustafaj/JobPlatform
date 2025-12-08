-- Create job_notifications table
CREATE TABLE IF NOT EXISTS job_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES job_alerts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_id ON job_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_is_read ON job_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_job_notifications_created_at ON job_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE job_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON job_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON job_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: System can insert notifications (for job posting)
CREATE POLICY "Allow insert notifications"
    ON job_notifications
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON job_notifications
    FOR DELETE
    USING (auth.uid() = user_id);
