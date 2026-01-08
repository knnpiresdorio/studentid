-- Allow users to view their own change requests
-- This is critical for the "Pending Photo" logic to work in the UI

CREATE POLICY "Users can view own requests" ON public.change_requests
FOR SELECT
USING (
  student_id = auth.uid() OR -- Student viewing own request
  student_id IN ( -- Parent viewing dependent request (if linked)
      SELECT id FROM public.profiles 
      WHERE parent_header_id = auth.uid()
  )
);

-- Allow School Admins to view requests for their school
CREATE POLICY "School Admins view requests" ON public.change_requests
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  )
);
