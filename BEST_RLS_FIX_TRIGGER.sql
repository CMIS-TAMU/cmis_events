-- 🎯 BEST SOLUTION: Database Trigger for User Profile Creation
-- This bypasses RLS entirely by using SECURITY DEFINER
-- Run this in Supabase SQL Editor

-- Step 1: Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING; -- Handle if profile already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT, SELECT, UPDATE ON public.users TO authenticated;

-- Step 4: Verify trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ✅ Done! Now when a user signs up, the profile is created automatically!
-- The signup code will still try to insert, but if it fails, the trigger handles it.
-- Or you can remove the manual INSERT from signup code (optional).

