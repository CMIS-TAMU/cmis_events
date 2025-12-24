# Quick Reference: Semantic Matching Implementation

## ✅ What's Ready to Use

### Resume Matching (For Sponsors)

**Endpoint:** `trpc.sponsors.searchResumesSemantic`

```typescript
// In your component
const { data: matches } = trpc.sponsors.searchResumesSemantic.useQuery({
  jobDescription: "Software engineer with React experience",
  threshold: 0.6,  // 60% minimum similarity
  limit: 20,
  skills: ['React', 'JavaScript'],  // Optional filters
  major: 'Computer Science',        // Optional
  minGpa: 3.0,                      // Optional
});
```

### Mentor Matching (For Students)

**Endpoint:** `trpc.mentorship.findMatchingMentorsSemantic`

```typescript
// Find mentors for current student
const { data: mentors } = trpc.mentorship.findMatchingMentorsSemantic.useQuery({
  threshold: 0.6,
  limit: 10,
  industry: 'Technology',  // Optional
});
```

**Endpoint:** `trpc.mentorship.searchMentorsSemantic`

```typescript
// Search with natural language
const { data: mentors } = trpc.mentorship.searchMentorsSemantic.useQuery({
  query: "Looking for a data science mentor",
  threshold: 0.6,
  limit: 10,
});
```

### Mentor Finding Students (For Mentors)

**Endpoint:** `trpc.mentorship.findMatchingStudentsSemantic`

```typescript
// Find students for current mentor
const { data: students } = trpc.mentorship.findMatchingStudentsSemantic.useQuery({
  threshold: 0.6,
  limit: 10,
  major: 'Computer Science',  // Optional
});
```

## 📋 Response Format

All endpoints return arrays with:
```typescript
{
  id: string,              // User ID
  email: string,
  full_name: string,
  similarity: number,      // 0-1 similarity score
  matchScore: number,      // 0-100 percentage match
  matchReasoning: object,  // Metadata about the match
  // ... other user/profile fields
}[]
```

## 🔧 Indexing Required

Before semantic search works, you need to index:

### Resumes
- Index resumes when uploaded
- Use: `indexResume()` from `@/lib/services/resume-matching`

### Profiles
- Index student profiles when created/updated
- Use: `indexStudentProfile()` from `@/lib/services/mentor-matching`
- Index mentor profiles when created/updated
- Use: `indexMentorProfile()` from `@/lib/services/mentor-matching`

## 📄 Full Documentation

See `SEMANTIC_MATCHING_IMPLEMENTATION.md` for:
- Complete API reference
- Integration examples
- Indexing scripts
- UI component examples

## 🚀 Next Steps

1. **Add semantic search to UI:**
   - Update `app/sponsor/resumes/page.tsx`
   - Update `app/mentorship/request/page.tsx`

2. **Auto-index on upload/create:**
   - Index resumes on upload
   - Index profiles on create/update

3. **Test and adjust thresholds:**
   - Try different threshold values
   - Find the sweet spot for your use case

