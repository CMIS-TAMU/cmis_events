-- ============================================================================
-- MENTORSHIP SYSTEM TEST DATA SETUP
-- ============================================================================
-- This script creates test data for comprehensive mentorship system testing
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE TEST USERS (if they don't exist)
-- ============================================================================

-- Test Student 1: Computer Science student with skills
INSERT INTO users (id, email, full_name, role, major, skills, graduation_year, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test.student1@tamu.edu',
  'Test Student One',
  'student',
  'Computer Science',
  ARRAY['Python', 'JavaScript', 'React', 'Node.js'],
  2025,
  '{"career_goals": "Software Engineering", "research_interests": ["Machine Learning", "Web Development"], "location": "College Station, TX", "communication_preferences": ["virtual", "email"]}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  graduation_year = EXCLUDED.graduation_year,
  metadata = EXCLUDED.metadata;

-- Test Student 2: Electrical Engineering student
INSERT INTO users (id, email, full_name, role, major, skills, graduation_year, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'test.student2@tamu.edu',
  'Test Student Two',
  'student',
  'Electrical Engineering',
  ARRAY['Circuit Design', 'Embedded Systems', 'C++'],
  2026,
  '{"career_goals": "Hardware Engineering", "research_interests": ["IoT", "Robotics"], "location": "College Station, TX", "communication_preferences": ["in-person", "phone"]}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  graduation_year = EXCLUDED.graduation_year,
  metadata = EXCLUDED.metadata;

-- Test Mentor 1: Software Engineering mentor
INSERT INTO users (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  'test.mentor1@example.com',
  'Test Mentor One',
  'faculty'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Test Mentor 2: Hardware Engineering mentor
INSERT INTO users (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000102',
  'test.mentor2@example.com',
  'Test Mentor Two',
  'faculty'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Test Mentor 3: General Tech mentor
INSERT INTO users (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000103',
  'test.mentor3@example.com',
  'Test Mentor Three',
  'faculty'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================================================
-- STEP 2: CREATE MENTOR PROFILES
-- ============================================================================

-- Mentor 1 Profile: Software Engineering
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  'mentor',
  'Software Engineering',
  ARRAY['Machine Learning', 'Web Development', 'React', 'Node.js', 'Python'],
  3,
  0,
  'active',
  true,
  'College Station, TX',
  ARRAY['virtual', 'email']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- Mentor 2 Profile: Hardware Engineering
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  '00000000-0000-0000-0000-000000000102',
  'mentor',
  'Hardware Engineering',
  ARRAY['IoT', 'Robotics', 'Circuit Design', 'Embedded Systems'],
  2,
  0,
  'active',
  true,
  'College Station, TX',
  ARRAY['in-person', 'virtual']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- Mentor 3 Profile: General Tech
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  '00000000-0000-0000-0000-000000000103',
  'mentor',
  'Technology',
  ARRAY['Career Development', 'Interview Prep', 'Technical Skills'],
  5,
  0,
  'active',
  true,
  'Remote',
  ARRAY['virtual', 'email', 'phone']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- ============================================================================
-- STEP 3: CREATE A TEST MATCH (for testing match details, meetings, feedback)
-- ============================================================================

-- Create an active match between Student 1 and Mentor 1
INSERT INTO matches (
  id,
  student_id,
  mentor_id,
  match_score,
  status,
  matched_at,
  activated_at,
  health_score,
  is_at_risk,
  match_reasoning
)
VALUES (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  85,
  'active',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  5,
  false,
  '{"career_goals": {"score": 100, "weight": 30}, "industry": {"score": 90, "weight": 25}, "technical_skills": {"score": 80, "weight": 15}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Update mentor's current mentees count
UPDATE mentorship_profiles
SET current_mentees = 1
WHERE user_id = '00000000-0000-0000-0000-000000000101'
  AND profile_type = 'mentor';

-- ============================================================================
-- STEP 4: CREATE SAMPLE MEETING LOGS
-- ============================================================================

-- Meeting 1: Initial meeting
INSERT INTO meeting_logs (
  id,
  match_id,
  meeting_date,
  duration_minutes,
  meeting_type,
  agenda,
  discussion_points,
  action_items,
  student_notes,
  mentor_notes,
  logged_by_id
)
VALUES (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000001001',
  NOW() - INTERVAL '5 days',
  60,
  'virtual',
  'Initial mentorship meeting - Getting to know each other',
  ARRAY['Career goals discussion', 'Skills assessment', 'Goal setting'],
  ARRAY['Student to update resume', 'Schedule next meeting'],
  'Great first meeting! Mentor provided valuable insights.',
  'Student is motivated and has clear goals.',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Meeting 2: Follow-up meeting
INSERT INTO meeting_logs (
  id,
  match_id,
  meeting_date,
  duration_minutes,
  meeting_type,
  agenda,
  discussion_points,
  action_items,
  student_notes,
  mentor_notes,
  logged_by_id
)
VALUES (
  '00000000-0000-0000-0000-000000002002',
  '00000000-0000-0000-0000-000000001001',
  NOW() - INTERVAL '2 days',
  45,
  'virtual',
  'Progress check-in',
  ARRAY['Resume review', 'Interview prep', 'Networking strategies'],
  ARRAY['Apply to 5 companies', 'Attend networking event'],
  'Helpful feedback on resume and interview prep.',
  'Student making good progress on goals.',
  '00000000-0000-0000-0000-000000000101'
)
ON CONFLICT (id) DO NOTHING;

-- Update match's last_meeting_at
UPDATE matches
SET last_meeting_at = NOW() - INTERVAL '2 days'
WHERE id = '00000000-0000-0000-0000-000000001001';

-- ============================================================================
-- STEP 5: CREATE SAMPLE FEEDBACK
-- ============================================================================

-- Feedback from student to mentor
INSERT INTO mentorship_feedback (
  id,
  match_id,
  feedback_from_id,
  feedback_about_id,
  rating,
  comment,
  feedback_type
)
VALUES (
  '00000000-0000-0000-0000-000000003001',
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  5,
  'Excellent mentor! Very helpful and responsive.',
  'general'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: CREATE SAMPLE QUICK QUESTIONS
-- ============================================================================

-- Question 1: Open question
INSERT INTO quick_questions (
  id,
  student_id,
  title,
  description,
  tags,
  status,
  preferred_response_time,
  expires_at
)
VALUES (
  '00000000-0000-0000-0000-000000004001',
  '00000000-0000-0000-0000-000000000002',
  'How to prepare for technical interviews?',
  'I have my first technical interview next week. What should I focus on to prepare effectively?',
  ARRAY['interview', 'career', 'technical'],
  'open',
  '48-hours',
  NOW() + INTERVAL '48 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Question 2: Claimed question
INSERT INTO quick_questions (
  id,
  student_id,
  title,
  description,
  tags,
  status,
  preferred_response_time,
  expires_at,
  claimed_by_mentor_id,
  claimed_at
)
VALUES (
  '00000000-0000-0000-0000-000000004002',
  '00000000-0000-0000-0000-000000000001',
  'Best practices for React project structure?',
  'I am starting a new React project. What is the recommended folder structure?',
  ARRAY['react', 'web-development', 'technical'],
  'claimed',
  '24-hours',
  NOW() + INTERVAL '24 hours',
  '00000000-0000-0000-0000-000000000101',
  NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Question 3: Completed question
INSERT INTO quick_questions (
  id,
  student_id,
  title,
  description,
  tags,
  status,
  preferred_response_time,
  expires_at,
  claimed_by_mentor_id,
  claimed_at,
  completed_at,
  student_rating
)
VALUES (
  '00000000-0000-0000-0000-000000004003',
  '00000000-0000-0000-0000-000000000001',
  'How to improve coding skills?',
  'What are the best ways to continuously improve coding skills?',
  ARRAY['career', 'skills'],
  'completed',
  '1-week',
  NOW() + INTERVAL '7 days',
  '00000000-0000-0000-0000-000000000103',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day',
  5
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 7: CREATE A PENDING MATCH BATCH (for testing requests)
-- ============================================================================

-- Create a pending match batch for Student 2
INSERT INTO match_batches (
  id,
  student_id,
  mentor_1_id,
  mentor_1_score,
  mentor_2_id,
  mentor_2_score,
  mentor_3_id,
  mentor_3_score,
  status,
  expires_at
)
VALUES (
  '00000000-0000-0000-0000-000000005001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000102',
  90,
  '00000000-0000-0000-0000-000000000103',
  75,
  '00000000-0000-0000-0000-000000000101',
  65,
  'pending',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check created test data
SELECT 'Test Users Created:' as info;
SELECT id, email, full_name, role FROM users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103'
);

SELECT 'Mentor Profiles Created:' as info;
SELECT user_id, industry, areas_of_expertise, availability_status, in_matching_pool 
FROM mentorship_profiles 
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103'
);

SELECT 'Active Match Created:' as info;
SELECT id, student_id, mentor_id, match_score, status 
FROM matches 
WHERE id = '00000000-0000-0000-0000-000000001001';

SELECT 'Meeting Logs Created:' as info;
SELECT COUNT(*) as meeting_count FROM meeting_logs 
WHERE match_id = '00000000-0000-0000-0000-000000001001';

SELECT 'Quick Questions Created:' as info;
SELECT COUNT(*) as question_count, status 
FROM quick_questions 
WHERE id IN (
  '00000000-0000-0000-0000-000000004001',
  '00000000-0000-0000-0000-000000004002',
  '00000000-0000-0000-0000-000000004003'
)
GROUP BY status;

SELECT 'Match Batch Created:' as info;
SELECT id, student_id, status FROM match_batches 
WHERE id = '00000000-0000-0000-0000-000000005001';

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '✅ TEST DATA SETUP COMPLETE!' as status;

SELECT 'Test Accounts Created:' as summary, COUNT(*) as count
FROM users 
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103'
);

SELECT 'Active Mentors Available:' as summary, COUNT(*) as count
FROM mentorship_profiles 
WHERE profile_type = 'mentor' 
  AND availability_status = 'active' 
  AND in_matching_pool = true;

