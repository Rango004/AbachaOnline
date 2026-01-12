# Railway Deployment Fix Guide

## Error: "ENV names can not be blank"

This error occurs when Railway tries to build a Dockerfile with empty environment variable names.

---

## ✅ **Immediate Fix:**

### **Step 1: Check Railway Environment Variables**

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **Backend** project
3. Click **Variables** tab
4. **Look for any variables with:**
   - Empty variable names (blank on the left side)
   - Empty values
   - Variables with just spaces

### **Step 2: Remove or Fix Blank Variables**

**Delete any variables that have:**
- ❌ Empty name
- ❌ Just whitespace
- ❌ Incomplete entries

**Common culprits:**
- Variables ending with `=` but no value
- Accidentally added empty rows
- Copy-paste errors

### **Step 3: Verify Required Variables**

Make sure these are set (can be commented out if optional):

**Required:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (Auto-injected by Railway)
JWT_SECRET=your_secret_here_min_32_chars
```

**Optional (can comment out if not configured):**
```
FRONTEND_URLS=https://localhost,capacitor://localhost
JWT_EXPIRES_IN=30d
REFRESH_TOKEN_EXPIRES_IN=90d
```

**Firebase (Optional - Leave blank if not using):**
```
# FIREBASE_PROJECT_ID=
# FIREBASE_PRIVATE_KEY=
# FIREBASE_CLIENT_EMAIL=
```

⚠️ **IMPORTANT:** If you don't have Firebase configured yet, **DELETE** or **COMMENT OUT** the Firebase variables entirely. Don't leave them with empty values.

### **Step 4: Trigger Redeploy**

After fixing variables:
1. Click **Deploy** → **Redeploy**
2. Or make a dummy commit and push to trigger auto-deploy

---

## 🔧 **Alternative Fix: Use Dockerfile Instead**

If the issue persists, we can use a custom Dockerfile:

**Create `backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Then update `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## 📋 **Checklist:**

- [ ] Checked Railway Variables tab for empty entries
- [ ] Removed or fixed any blank variable names/values
- [ ] Verified required variables are set
- [ ] Firebase variables deleted (if not configured)
- [ ] Triggered redeploy
- [ ] Checked Railway logs for success

---

## 🐛 **Still Having Issues?**

**Check Railway Logs:**
1. Go to Railway Dashboard
2. Click your Backend service
3. Click **Deployments** tab
4. Click latest deployment
5. Look for specific error messages

**Common issues:**
- Missing DATABASE_URL (should be auto-injected)
- Missing JWT_SECRET
- Malformed environment variables (newlines, special chars)

---

## ✅ **Expected Result:**

After fixing, you should see:
```
╔════════ Nixpacks v1.41.0 ═══════╗
║ setup      │ nodejs_18, npm-9_x ║
║─────────────────────────────────║
║ install    │ npm ci             ║
║─────────────────────────────────║
║ start      │ npm start          ║
╚═════════════════════════════════╝

Build successful
Deployment active
```

---

**Need help?** Share the full Railway deployment log for more specific guidance.
