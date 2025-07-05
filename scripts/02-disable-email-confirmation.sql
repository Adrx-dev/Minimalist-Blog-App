-- This script shows the SQL commands, but these settings are typically changed in the Supabase Dashboard
-- Go to Authentication > Settings in your Supabase Dashboard and:
-- 1. Turn OFF "Enable email confirmations"
-- 2. Set "Site URL" to your domain (e.g., http://localhost:3000 for development)

-- Alternatively, you can use the Supabase Management API or these SQL commands if you have the right permissions:

-- Update auth configuration to disable email confirmation
-- Note: This might require superuser privileges and may not work in all Supabase setups
-- UPDATE auth.config SET enable_signup = true, enable_email_confirmations = false WHERE id = 1;

-- For development, you might also want to allow localhost URLs
-- This is typically done in the Dashboard under Authentication > URL Configuration
