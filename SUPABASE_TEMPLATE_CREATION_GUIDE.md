# How to Create a Template in Supabase - Step by Step

## 📝 Step-by-Step Instructions

### Step 1: Open the Form
You're already there! You should see the "Add new row to communication_templates" form.

### Step 2: Fill in Each Field

**You DON'T paste JSON** - you fill in each field individually in the form:

---

## Required Fields (Fill These):

### 1. **id** (uuid)
- **Leave this EMPTY** or click the "Generate" button
- Supabase will auto-generate a UUID for you
- **Don't paste the URL** - that's not correct

### 2. **name** (text)
- Click in the text area
- Type: `Welcome Email`
- This is the template name

### 3. **description** (text) - Optional but recommended
- Click in the text area
- Type: `Welcome email for new registrations`

### 4. **type** (text)
- Click in the text area
- Type exactly: `email`
- Must be one of: `email`, `sms`, or `social`

### 5. **channel** (text) - Optional
- Click in the text area
- Type: `email`
- Or leave as NULL

### 6. **subject** (text) - Optional
- Click in the text area
- Type: `Welcome to {{event_name}}!`
- This is the email subject line

### 7. **body** (text) - **REQUIRED**
- Click in the text area
- Type or paste:
  ```
  <h1>Hi {{user_name}}!</h1>
  <p>Thank you for registering for {{event_name}}.</p>
  <p>Event Date: {{event_date}}</p>
  ```
- This is the email body (HTML)

---

## Optional Fields (Scroll Down):

### 8. **variables** (jsonb)
- Click in the field
- Type: `{}`
- Or leave as NULL
- This is for template variables (empty object for now)

### 9. **target_audience** (text) - Optional
- Click in the text area
- Type: `registration`
- This helps categorize the template

### 10. **is_active** (boolean)
- **Check the checkbox** ✅
- This makes the template active

### 11. **created_by** (uuid)
- Click in the field
- **You need to get your user ID first:**
  1. Open a new tab in Supabase
  2. Go to `users` table
  3. Find your user row
  4. Copy the `id` value (it's a UUID like: `123e4567-e89b-12d3-a456-426614174000`)
  5. Paste it in the `created_by` field

### 12. **created_at** (timestamptz)
- **Leave empty** - Supabase will auto-fill this

### 13. **updated_at** (timestamptz)
- **Leave empty** - Supabase will auto-fill this

---

## 📋 Quick Fill Checklist

Fill in these fields in order:

```
✅ id: (Leave empty - auto-generated)
✅ name: Welcome Email
✅ description: Welcome email for new registrations
✅ type: email
✅ channel: email
✅ subject: Welcome to {{event_name}}!
✅ body: <h1>Hi {{user_name}}!</h1><p>Thank you for registering for {{event_name}}.</p>
✅ variables: {}
✅ target_audience: registration
✅ is_active: ✓ (check the box)
✅ created_by: [Your user ID from users table]
✅ created_at: (Leave empty)
✅ updated_at: (Leave empty)
```

---

## 🎯 Visual Guide

When filling the form:

1. **For text fields:**
   - Click the field
   - Type your text
   - The "NULL" will disappear when you start typing

2. **For JSON fields (variables):**
   - Click the field
   - Type: `{}`
   - This creates an empty JSON object

3. **For boolean (is_active):**
   - Click the checkbox to check it ✅

4. **For UUID (created_by):**
   - Get your user ID from the `users` table first
   - Paste the UUID in this field

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't paste the entire JSON** - fill fields individually
❌ **Don't paste a URL in the id field** - leave it empty
❌ **Don't forget to check `is_active`** - template won't show if inactive
❌ **Don't forget `created_by`** - you need your user ID

---

## ✅ After Filling All Fields

1. Scroll to the bottom
2. Click the green **"Save"** button
3. The template will be created
4. Go back to your templates page: `http://localhost:3000/admin/communications/templates`
5. Refresh the page
6. You should see your new template!

---

## 🔍 How to Get Your User ID

If you don't know your user ID:

1. In Supabase, go to **Table Editor**
2. Click on **`users`** table
3. Find your user row (by email)
4. Click on the row to view details
5. Copy the **`id`** value (it's a long UUID)
6. Paste it in the `created_by` field

---

## 📝 Example: Complete Field Values

Here's what each field should contain:

| Field | Value |
|-------|-------|
| id | (empty - auto) |
| name | `Welcome Email` |
| description | `Welcome email for new registrations` |
| type | `email` |
| channel | `email` |
| subject | `Welcome to {{event_name}}!` |
| body | `<h1>Hi {{user_name}}!</h1><p>Thank you for registering.</p>` |
| variables | `{}` |
| target_audience | `registration` |
| is_active | `true` (checked) |
| created_by | `your-user-uuid-here` |
| created_at | (empty - auto) |
| updated_at | (empty - auto) |

---

**Once you click "Save", your template will be created and visible in the UI!** 🎉


