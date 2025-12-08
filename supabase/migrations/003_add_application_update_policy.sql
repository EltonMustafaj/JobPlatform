-- Add policy for employers to update applications (e.g. change status)
CREATE POLICY "Employers can update applications for their jobs"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = applications.job_id
      AND employer_id = auth.uid()
    )
  );
