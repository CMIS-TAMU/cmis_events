# How to View Server Logs

## 📍 Where Are Server Logs?

The server logs appear in the **terminal/command prompt window** where you started the development server with `pnpm dev`.

## 🔍 Step-by-Step Guide

### Step 1: Find the Terminal Window
- Look for a terminal/PowerShell/Command Prompt window
- It should show output like:
  ```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
  ```

### Step 2: Keep It Visible
- **Don't close** this terminal window
- Keep it visible on your screen while testing
- New log messages will appear here in real-time

### Step 3: Watch for Logs When Testing
When you upload a resume, you'll see logs like:
```
[Resume Upload] Admin client created successfully
[Resume Upload] Checking if user exists: abc123...
[Resume Upload] User found, current version: 0
[Resume Upload] Updating user record with admin client...
[Resume Upload] Update successful!
```

Or if there's an error:
```
[Resume Upload] Database update error: ...
[Resume Upload] Error code: 42501
[Resume Upload] Error message: new row violates row-level security policy
```

## 🖥️ Visual Guide

### In VS Code / Cursor:
1. Look at the **Terminal** panel at the bottom
2. You should see a tab showing the output
3. If you don't see it, press `` Ctrl+` `` (backtick) to open terminal

### In Separate Terminal Window:
1. The window where you ran `pnpm dev`
2. It should be showing server output
3. Scroll up to see previous messages

## 🔧 If You Don't See a Terminal

### Option 1: Check if Server is Running
1. Open a new terminal
2. Run: `pnpm dev`
3. Wait for "Ready" message
4. Keep this window open

### Option 2: Check Background Processes
The server might be running in the background. To see it:
1. Look for a Node.js process in Task Manager
2. Or restart the server in a visible terminal

## 📸 What Logs Look Like

### Normal Upload (Success):
```
[Resume Upload] Admin client created successfully
[Resume Upload] Checking if user exists: ad3b5218-f082-4a28-a23d-eea7aac6c122
[Resume Upload] User found, current version: 0
[Resume Upload] Updating user record with admin client...
[Resume Upload] Update successful!
POST /api/resume/upload 200 in 1234ms
```

### Error Case:
```
[Resume Upload] Admin client created successfully
[Resume Upload] Checking if user exists: ad3b5218-f082-4a28-a23d-eea7aac6c122
[Resume Upload] User found, current version: 0
[Resume Upload] Updating user record with admin client...
[Resume Upload] Database update error: {
  code: '42501',
  message: 'new row violates row-level security policy',
  details: '...',
  hint: '...'
}
POST /api/resume/upload 500 in 567ms
```

## 💡 Tips

1. **Scroll Up**: If you miss a log, scroll up in the terminal
2. **Clear Screen**: Use `Ctrl+L` or `cls` to clear, but logs will still appear
3. **Copy Logs**: Right-click in terminal → Select → Copy to share logs
4. **Filter**: Look for `[Resume Upload]` to find relevant logs quickly

## 🆘 Still Can't Find Logs?

1. **Restart the server** in a new terminal window
2. **Make sure** you're looking at the right terminal (the one running `pnpm dev`)
3. **Check** if the server is actually running (visit http://localhost:3000)

## 📋 Quick Checklist

- [ ] Terminal window is open and visible
- [ ] Server shows "Ready" or "compiled successfully"
- [ ] Terminal is showing real-time output
- [ ] I can see logs when I perform actions (like uploading)


