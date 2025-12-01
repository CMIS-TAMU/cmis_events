# 📦 Supabase Storage Bucket Setup - Competition Submissions

## Step-by-Step Guide to Create Storage Bucket

### Step 1: Open Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Storage** in the left sidebar (under "Database")

---

### Step 2: Create New Bucket

1. Click the **"New bucket"** button (usually at the top right)
2. Fill in the bucket details:
   - **Name**: `competition-submissions`
   - **Public bucket**: ✅ **Check this box** (allows public access to files)
   - **File size limit**: Leave default or set to `10 MB` (matches our validation)
   - **Allowed MIME types**: (Optional - leave empty for all types)
     - Or specify: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation`

3. Click **"Create bucket"**

---

### Step 3: Configure Bucket Settings (If Needed)

If you want more control, you can:

1. Click on the bucket name to open settings
2. Configure:
   - **File size limit**: Set to 10 MB (10,485,760 bytes)
   - **Allowed file types**: Leave empty or specify the MIME types above

---

### Step 4: Set Up Storage Policies (RLS)

If you created a **private bucket** (unchecked "Public bucket"), you'll need to set up Row Level Security policies.

#### Option A: Public Bucket (Recommended for Quick Setup)

If you checked "Public bucket" in Step 2, you're done! Files will be publicly accessible via URL.

#### Option B: Private Bucket with RLS Policies

If you want a private bucket, create these policies in the Supabase SQL Editor:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'competition-submissions' AND
  (storage.foldername(name))[1] = 'competitions'
);

-- Allow authenticated users to view submissions
CREATE POLICY "Authenticated users can view submissions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'competition-submissions' AND
  (storage.foldername(name))[1] = 'competitions'
);

-- Allow team members to update their own submissions
CREATE POLICY "Team members can update own submissions"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'competition-submissions' AND
  (storage.foldername(name))[1] = 'competitions'
);

-- Allow team leaders to delete their team's submissions
CREATE POLICY "Team leaders can delete own submissions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'competition-submissions' AND
  (storage.foldername(name))[1] = 'competitions'
);
```

---

### Step 5: Verify Bucket Creation

1. In the Storage page, you should see the `competition-submissions` bucket listed
2. Click on it to verify it's empty (or check settings)

---

## 📁 Folder Structure

Files will be organized as:
```
competition-submissions/
  └── competitions/
      └── {competition_id}/
          └── {team_id}/
              └── {timestamp}_filename.pdf
```

Example path:
```
competitions/123e4567-e89b-12d3-a456-426614174000/789e4567-e89b-12d3-a456-426614174001/1699123456789_submission.pdf
```

---

## ✅ Quick Setup Checklist

- [ ] Created bucket named `competition-submissions`
- [ ] Set bucket as **Public** (recommended for easier access)
- [ ] File size limit set to 10 MB
- [ ] Bucket appears in Storage list
- [ ] (Optional) Test upload a file manually

---

## 🧪 Test the Setup

After creating the bucket, you can test it:

1. Go to Storage → `competition-submissions`
2. Click **"Upload file"**
3. Upload a test PDF file
4. Verify the file appears in the bucket

---

## 🔒 Security Considerations

### Public Bucket (Current Setup)
- ✅ Simple setup
- ✅ Files accessible via public URL
- ⚠️ Anyone with the URL can access files
- **Recommendation**: OK for competition submissions if URLs are not shared publicly

### Private Bucket with RLS
- ✅ More secure
- ✅ Requires authentication
- ⚠️ Need to generate signed URLs for access
- **Recommendation**: Use if submissions contain sensitive information

---

## 📝 Notes

- The bucket name **must** match: `competition-submissions` (exact match)
- Files are organized by competition ID and team ID automatically
- Maximum file size validation is also in the code (10 MB)
- Supported file types: PDF, DOC, DOCX, PPT, PPTX

---

## 🆘 Troubleshooting

### "Bucket not found" error
- Check the bucket name matches exactly: `competition-submissions`
- Ensure the bucket exists in your Supabase project

### "Permission denied" error
- If using a private bucket, make sure RLS policies are set up
- Or switch to a public bucket

### "File too large" error
- Check bucket file size limit settings
- Ensure it's set to at least 10 MB

---

**Next Steps**: After creating the bucket, you can test team submissions in the application!

