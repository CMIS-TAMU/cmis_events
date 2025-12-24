# Resume Search Demo Guide

## 🎯 How to Test Semantic Search

### Step 1: Access the Resume Search Page

1. Log in as a **sponsor** user
2. Navigate to `/sponsor/resumes`

### Step 2: Semantic Search is Active by Default

You'll see:
- **"Semantic Search"** tab is selected (with AI badge)
- A blue info box saying "AI-Powered Semantic Search Active"
- A pre-filled job description textarea

### Step 3: Try Different Job Descriptions

The search automatically runs as you type. Try these examples:

**Example 1: Software Engineer**
```
Looking for a software engineer with React and JavaScript experience. 
Should have strong problem-solving skills and be able to work in a team environment.
```

**Example 2: Data Scientist**
```
Seeking a data scientist with machine learning experience. 
Should know Python, SQL, and have experience with neural networks.
```

**Example 3: Full Stack Developer**
```
Need a full stack developer familiar with modern web technologies.
Experience with Node.js, React, and databases required.
```

### Step 4: See the Results

- Each candidate card shows a **match score badge** (e.g., "85% Match")
- Results are sorted by relevance (best matches first)
- You can still filter by major, GPA, skills, etc.

### Step 5: Compare with Keyword Search

Click the **"Keyword Search"** tab to see the difference:
- Keyword search only matches exact terms
- Semantic search understands context and meaning

## 📸 What You'll See

### Semantic Search View:
```
┌─────────────────────────────────────────┐
│  🧠 Search Type                         │
│  [Keyword Search] [Semantic Search AI]  │
│                                         │
│  ✓ AI-Powered Semantic Search Active    │
│  Our AI understands meaning and context │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🧠 Job Description (AI Semantic Search)│
│  ┌───────────────────────────────────┐  │
│  │ Looking for a software engineer   │  │
│  │ with React experience...          │  │
│  └───────────────────────────────────┘  │
│  [🔍 Search]                            │
└─────────────────────────────────────────┘

Results:
- 👤 John Doe | 92% Match ⭐
- 👤 Jane Smith | 87% Match
- 👤 Bob Johnson | 78% Match
```

## 🎬 Demo Scenarios

### Scenario 1: Finding a React Developer
**Job Description:**
```
Looking for a frontend developer with React expertise. 
Experience with TypeScript, state management, and modern build tools preferred.
```

**What AI finds:**
- Developers with "React.js" in their resume (exact match)
- Developers with "frontend development" and "JavaScript frameworks" (semantic match)
- Developers with "web development" and "component-based architecture" (semantic match)

### Scenario 2: Machine Learning Engineer
**Job Description:**
```
Seeking ML engineer with experience in deep learning and neural networks.
Python proficiency and experience with TensorFlow or PyTorch required.
```

**What AI finds:**
- Engineers with "machine learning" mentioned
- Engineers with "AI" or "artificial intelligence" experience
- Engineers with "data science" and "predictive modeling"

## 💡 Tips for Best Results

1. **Be descriptive** - More detail helps AI understand better
2. **Use natural language** - Write like you're describing to a colleague
3. **Include key skills** - Mention technologies, tools, or methodologies
4. **Match threshold** - Lower threshold (0.5) shows more results, higher (0.7) shows only best matches

## 🔍 Understanding Match Scores

- **90-100%**: Excellent match, highly relevant
- **70-89%**: Good match, likely relevant
- **50-69%**: Moderate match, may be relevant
- **Below 50%**: Filtered out (adjust threshold to see)

## 🚀 Quick Demo Checklist

- [ ] Navigate to `/sponsor/resumes`
- [ ] See "Semantic Search" tab is active
- [ ] Enter a job description
- [ ] See candidates with match scores
- [ ] Compare with keyword search
- [ ] Try different job descriptions
- [ ] Filter by major/GPA while using semantic search

## 📝 Notes

- Semantic search requires resumes to be indexed (run `pnpm index-resumes`)
- The search happens automatically as you type
- Match scores help you prioritize candidates
- You can combine semantic search with filters (major, GPA, skills)

---

**Ready to demo?** Just navigate to the resume search page and start typing a job description!

