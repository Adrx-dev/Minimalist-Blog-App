-- Instructions for disabling email confirmation in Supabase Dashboard:
-- 
-- 1. Go to https://supabase.com/dashboard/project/bpzmonsdihmvawtlurhl
-- 2. Navigate to Authentication > Settings
-- 3. Scroll down to "User Signups" section
-- 4. Turn OFF "Enable email confirmations"
-- 5. Set "Site URL" to: http://localhost:3000 (for development)
-- 6. In "Redirect URLs" add: http://localhost:3000/auth/callback
-- 7. Save changes
--
-- Alternative: If you have access to SQL Editor with proper permissions:
-- UPDATE auth.config SET enable_signup = true WHERE instance_id = auth.jwt() ->> 'iss';

-- Verify current auth settings (read-only query)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE email_confirmed_at IS NULL 
      AND created_at > NOW() - INTERVAL '1 minute'
    ) 
    THEN 'Email confirmation may still be enabled'
    ELSE 'Settings appear correct'
  END as status;
