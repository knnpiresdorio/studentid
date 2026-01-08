-- Function to safely handle student profile update requests (Photo/Info)
-- Bypasses RLS to allow "UPSERT" behavior (Update if pending exists, otherwise Insert)

CREATE OR REPLACE FUNCTION public.request_profile_update(
  p_student_id UUID,
  p_school_id UUID,
  p_student_name TEXT,
  p_type TEXT,
  p_reason TEXT,
  p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to manage the logic safely
SET search_path = public -- Security best practice
AS $$
DECLARE
  v_existing_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Check for existing PENDING request of same type for this student
  SELECT id INTO v_existing_id
  FROM public.change_requests
  WHERE student_id = p_student_id
    AND type = p_type
    AND status = 'PENDING'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- 2. UPDATE existing request
    UPDATE public.change_requests
    SET 
      payload = p_payload,
      reason = p_reason,
      created_at = NOW(), -- Bump timestamp
      status = 'PENDING'  -- Ensure it's pending (in case it was something else, though query filters pending)
    WHERE id = v_existing_id
    RETURNING to_jsonb(change_requests.*) INTO v_result;
    
  ELSE
    -- 3. INSERT new request
    INSERT INTO public.change_requests (
      school_id, student_id, student_name, type, reason, payload, status
    ) VALUES (
      p_school_id, p_student_id, p_student_name, p_type, p_reason, p_payload, 'PENDING'
    )
    RETURNING to_jsonb(change_requests.*) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;
