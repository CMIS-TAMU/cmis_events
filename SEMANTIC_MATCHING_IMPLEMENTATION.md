# Semantic Search for Resume and Mentor Matching - Implementation Guide

This guide explains how to use semantic search for resume matching and mentor matching in the CMIS Events application.

## ✅ What's Been Implemented

### 1. Resume Matching Service
**File:** `lib/services/resume-matching.ts`

- ✅ Index resumes with embeddings
- ✅ Match resumes to job descriptions using semantic search
- ✅ Filter by skills, major, GPA
- ✅ Store job descriptions for matching

### 2. Mentor Matching Service
**File:** `lib/services/mentor-matching.ts`

- ✅ Index student and mentor profiles with embeddings
- ✅ Find matching mentors for students
- ✅ Find matching students for mentors
- ✅ Search mentors using natural language queries

### 3. API Endpoints (tRPC)

**Sponsors Router** (`server/routers/sponsors.router.ts`):
- ✅ `searchResumesSemantic` - Semantic search for resumes by job description

**Mentorship Router** (`server/routers/mentorship.router.ts`):
- ✅ `findMatchingMentorsSemantic` - Find mentors for current student
- ✅ `searchMentorsSemantic` - Search mentors with natural language
- ✅ `findMatchingStudentsSemantic` - Find students for current mentor

## 🚀 How to Use

### Resume Matching (For Sponsors)

#### Step 1: Index Resumes

When a student uploads a resume, automatically index it:

```typescript
import { indexResume, extractResumeText } from '@/lib/services/resume-matching';

// When resume is uploaded
const resumeText = await extractResumeText(pdfBuffer);
await indexResume(resumeId, resumeText, userId, {
  fileName: resume.filename,
  major: user.major,
  skills: user.skills,
  gpa: user.gpa,
});
```

#### Step 2: Search Resumes Semantically

**In Frontend:**

```typescript
const { data: matches } = trpc.sponsors.searchResumesSemantic.useQuery({
  jobDescription: "Looking for a software engineer with experience in React and Node.js. Should have strong problem-solving skills and be able to work in a team environment.",
  threshold: 0.6,
  limit: 20,
  skills: ['React', 'Node.js'],
  minGpa: 3.0,
});
```

**Results include:**
- User data (name, email, major, GPA, skills)
- `similarity` - Match score (0-1)
- `matchScore` - Match percentage (0-100)

### Mentor Matching

#### Step 1: Index Student Profiles

When a student creates/updates their profile:

```typescript
import { indexStudentProfile } from '@/lib/services/mentor-matching';

await indexStudentProfile(studentId, {
  goals: "I want to transition into data science",
  interests: "Machine learning, Python, statistics",
  careerPath: "Data Scientist",
  skills: ['Python', 'SQL', 'Machine Learning'],
  major: 'Computer Science',
  graduationYear: 2025,
  preferredMentorTraits: ['Industry experience', 'Patient'],
  areasOfFocus: ['Career guidance', 'Technical skills'],
});
```

#### Step 2: Index Mentor Profiles

When a mentor creates/updates their profile:

```typescript
import { indexMentorProfile } from '@/lib/services/mentor-matching';

await indexMentorProfile(mentorId, {
  expertise: "10 years in data science, machine learning engineer",
  experience: "Led ML teams at major tech companies",
  specialization: "Machine Learning, Data Engineering",
  industry: "Technology",
  skills: ['Python', 'TensorFlow', 'AWS'],
  background: "PhD in Computer Science, started 3 companies",
  mentoringStyle: "Hands-on, practical guidance",
  availability: "Weekday evenings",
});
```

#### Step 3: Find Matching Mentors

**In Frontend:**

```typescript
// Option 1: Find mentors for current student
const { data: mentors } = trpc.mentorship.findMatchingMentorsSemantic.useQuery({
  threshold: 0.6,
  limit: 10,
  industry: 'Technology',
});

// Option 2: Search with natural language
const { data: mentors } = trpc.mentorship.searchMentorsSemantic.useQuery({
  query: "I'm looking for a mentor in data science who can help with career transitions",
  threshold: 0.6,
  limit: 10,
});
```

#### Step 4: Find Matching Students (For Mentors)

```typescript
const { data: students } = trpc.mentorship.findMatchingStudentsSemantic.useQuery({
  threshold: 0.6,
  limit: 10,
  major: 'Computer Science',
});
```

## 📋 Integration Steps

### For Resume Matching

1. **Update Resume Upload Handler**
   - When resume is uploaded, extract text and index it
   - File: `app/api/resume/upload/route.ts` or similar

2. **Update Sponsor Resume Search Page**
   - Add semantic search option to `app/sponsor/resumes/page.tsx`
   - Add toggle for "Semantic Search" vs "Keyword Search"
   - Show match scores for results

3. **Index Existing Resumes**
   - Create script to index all existing resumes
   - Similar to `scripts/index-all-events.ts`

### For Mentor Matching

1. **Update Profile Creation/Update**
   - When student/mentor profile is created/updated, index it
   - Files: `server/routers/mentorship.router.ts` (createProfile/updateProfile)

2. **Update Matching Flow**
   - Optionally use semantic matching in `requestMentor`
   - Or use as an alternative/additional matching method
   - Update UI to show semantic match scores

3. **Index Existing Profiles**
   - Create script to index all existing mentorship profiles

## 🎨 UI Integration Examples

### Resume Search with Semantic Option

```tsx
// app/sponsor/resumes/page.tsx
const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
const [jobDescription, setJobDescription] = useState('');

// Semantic search
const { data: semanticResults } = trpc.sponsors.searchResumesSemantic.useQuery(
  {
    jobDescription,
    threshold: 0.6,
    limit: 20,
  },
  { enabled: searchType === 'semantic' && !!jobDescription }
);

// Display results with match scores
{semanticResults?.map((candidate) => (
  <Card>
    <CardHeader>
      <CardTitle>{candidate.full_name}</CardTitle>
      <Badge>{candidate.matchScore}% Match</Badge>
    </CardHeader>
    {/* ... */}
  </Card>
))}
```

### Mentor Search with Semantic Option

```tsx
// app/mentorship/request/page.tsx
const [searchQuery, setSearchQuery] = useState('');

const { data: mentors } = trpc.mentorship.searchMentorsSemantic.useQuery(
  {
    query: searchQuery,
    threshold: 0.6,
    limit: 10,
  },
  { enabled: !!searchQuery }
);

{mentors?.map((mentor) => (
  <Card>
    <CardHeader>
      <CardTitle>{mentor.full_name}</CardTitle>
      <Badge>{mentor.matchScore}% Match</Badge>
    </CardHeader>
    <p>Similarity: {mentor.similarity.toFixed(2)}</p>
    {/* ... */}
  </Card>
))}
```

## 📝 Indexing Scripts

### Index All Resumes

Create `scripts/index-all-resumes.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { indexResume, extractResumeText } from '../lib/services/resume-matching';

// Similar to index-all-events.ts
// Fetch all users with resumes
// Extract text from PDFs
// Index each resume
```

### Index All Mentorship Profiles

Create `scripts/index-all-mentorship-profiles.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { indexStudentProfile, indexMentorProfile } from '../lib/services/mentor-matching';

// Fetch all student profiles
// Fetch all mentor profiles
// Index each profile
```

## 🔧 Configuration

### Thresholds

- **Resume Matching:** Default 0.6 (60% similarity)
  - Lower = more results, less relevant
  - Higher = fewer results, more relevant

- **Mentor Matching:** Default 0.6 (60% similarity)
  - Adjust based on desired match quality

### Content Types

The system uses these content types in the embeddings table:
- `resume` - Resume embeddings
- `job_description` - Job description embeddings
- `student_profile` - Student profile embeddings
- `mentor_profile` - Mentor profile embeddings

## 🎯 Benefits

1. **Better Matching**
   - Understands context and meaning
   - Finds relevant matches even without exact keywords

2. **Natural Language Queries**
   - "Looking for a mentor in data science"
   - "Need someone with React experience"

3. **Improved User Experience**
   - More relevant results
   - Match scores show relevance
   - Better recommendations

## 📚 Next Steps

1. **Integrate into existing pages:**
   - Update `app/sponsor/resumes/page.tsx` with semantic search
   - Update `app/mentorship/request/page.tsx` with semantic matching

2. **Create indexing scripts:**
   - Index existing resumes
   - Index existing mentorship profiles

3. **Update upload/creation handlers:**
   - Auto-index when resumes are uploaded
   - Auto-index when profiles are created/updated

4. **Test and iterate:**
   - Test with real data
   - Adjust thresholds
   - Fine-tune matching criteria

## 🔗 Related Files

- `lib/services/resume-matching.ts` - Resume matching service
- `lib/services/mentor-matching.ts` - Mentor matching service
- `server/routers/sponsors.router.ts` - Sponsor API endpoints
- `server/routers/mentorship.router.ts` - Mentorship API endpoints
- `lib/services/content-search.ts` - Generic content search service
- `lib/ai/embeddings.ts` - Core embedding generation

