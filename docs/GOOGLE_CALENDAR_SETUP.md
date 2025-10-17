# Google Calendar Integration - Setup Guide

## 🎯 Overview

Complete guide to setting up Google Calendar OAuth integration for bi-directional calendar sync in Lumio.

## 📋 Prerequisites

- Google Account (personal or workspace)
- Access to Google Cloud Console
- Lumio deployed with accessible URL

## 🔧 Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**

   - Click "Select a project" dropdown (top bar)
   - Click "NEW PROJECT"
   - Enter project name: `Lumio Calendar Integration`
   - Click "CREATE"

3. **Wait for Project Creation**
   - You'll see a notification when ready
   - Click "SELECT PROJECT" to activate it

## 🔑 Step 2: Enable Google Calendar API

1. **Enable API**

   - In Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on "Google Calendar API"
   - Click "ENABLE"

2. **Wait for Activation**
   - API will be enabled in a few seconds

## 🔐 Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**

   - Navigate to: "APIs & Services" > "OAuth consent screen"

2. **Choose User Type**

   - Select "External" (for public use)
   - Click "CREATE"

3. **Fill App Information**

   - **App name**: `Lumio`
   - **User support email**: Your email
   - **App logo**: (Optional) Upload Lumio logo
   - **Application home page**: `https://yourdomain.com`
   - **Application privacy policy link**: `https://yourdomain.com/privacy`
   - **Application terms of service link**: `https://yourdomain.com/terms`
   - **Authorized domains**: `yourdomain.com` (your Lumio domain)
   - **Developer contact information**: Your email

4. **Click SAVE AND CONTINUE**

5. **Scopes**

   - Click "ADD OR REMOVE SCOPES"
   - Search and select:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar.readonly`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

6. **Test Users** (for development)

   - Click "ADD USERS"
   - Add your test email addresses
   - Click "SAVE AND CONTINUE"

7. **Summary**
   - Review your settings
   - Click "BACK TO DASHBOARD"

## 🆔 Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**

   - Navigate to: "APIs & Services" > "Credentials"

2. **Create Credentials**

   - Click "CREATE CREDENTIALS" dropdown
   - Select "OAuth client ID"

3. **Configure OAuth Client**
   - **Application type**: `Web application`
   - **Name**: `Lumio Calendar Sync`
4. **Authorized JavaScript Origins**

   - Click "ADD URI"
   - Add: `https://yourdomain.com` (your Lumio production URL)
   - For development: `http://localhost:3000`

5. **Authorized Redirect URIs**

   - Click "ADD URI"
   - Add: `https://yourdomain.com/api/integrations/google-calendar/callback`
   - For development: `http://localhost:3000/api/integrations/google-calendar/callback`

6. **Click CREATE**

7. **Save Your Credentials**
   - A modal will appear with:
     - **Client ID**: `123456789-abcdefgh.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxx`
   - **IMPORTANT**: Copy these immediately and save securely
   - Click "OK"

## 🔒 Step 5: Configure Lumio Environment Variables

1. **Open Your `.env.local` File**

   ```bash
   # In your Lumio project root
   nano .env.local
   # or
   code .env.local
   ```

2. **Add Google Calendar Credentials**

   ```bash
   # Google Calendar OAuth
   GOOGLE_CLIENT_ID="123456789-abcdefgh.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxx"

   # Your app URL (MUST match OAuth redirect URI)
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   # For development:
   # NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Save and Close**

4. **Restart Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## ✅ Step 6: Test the Integration

### Test OAuth Flow

1. **Login to Lumio**

   - Navigate to your Lumio dashboard

2. **Go to Integrations**

   - Settings > Integrations

3. **Find Google Calendar**

   - Scroll to "Calendar" category
   - Locate "Google Calendar" card

4. **Click "Connect"**

   - You'll be redirected to Google
   - Sign in with your Google account
   - Review permissions:
     - See, edit, share, and permanently delete all calendars
     - View and edit events on all your calendars
   - Click "Continue"

5. **Authorization Success**
   - You'll be redirected back to Lumio
   - URL will show: `?success=google_calendar`
   - Google Calendar card should show "Connected"

### Test Calendar Sync

1. **Go to Calendar Page**

   - Navigate to Dashboard > Calendar

2. **Create Test Event**

   - Click "New Event"
   - Fill in details:
     - Title: "Test Sync Event"
     - Date: Tomorrow
     - Time: 2 PM
   - Save

3. **Sync to Google**

   - Click "Sync Google" button (top right)
   - Wait for success message

4. **Verify in Google Calendar**

   - Open Google Calendar (calendar.google.com)
   - Check tomorrow at 2 PM
   - Event should appear: "Test Sync Event"

5. **Create Event in Google**

   - In Google Calendar, create new event:
     - Title: "Google Test Event"
     - Time: Tomorrow, 3 PM
   - Save

6. **Sync from Google**
   - Back in Lumio Calendar
   - Click "Sync Google" again
   - Event should import: "Google Test Event"

## 🚀 Step 7: Publish OAuth App (Production)

### For Development (Testing)

- Keep app in "Testing" mode
- Only test users can authenticate
- No approval needed from Google

### For Production (Public)

1. **Complete App Verification**

   - Google Cloud Console > OAuth consent screen
   - Click "PUBLISH APP"
   - Submit for verification if needed

2. **Verification Process**

   - Required if requesting sensitive scopes
   - Google will review:
     - Privacy policy
     - Terms of service
     - Data usage
   - Can take 1-4 weeks

3. **Alternative: Internal Use**
   - If using with Google Workspace
   - Set user type to "Internal"
   - Available only to organization users
   - No verification needed

## 🔄 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: Redirect URI doesn't match configured URI

**Solution**:

1. Check `.env.local` has correct `NEXT_PUBLIC_APP_URL`
2. Verify OAuth client has exact redirect URI
3. Must include `/api/integrations/google-calendar/callback`
4. Check for trailing slashes (should not have)
5. Development must use `http://localhost:3000`
6. Production must use `https://` with your domain

### Error: "invalid_client"

**Problem**: Client ID or Secret incorrect

**Solution**:

1. Copy credentials again from Google Cloud Console
2. Check for extra spaces in `.env.local`
3. Restart dev server after changing env vars
4. Verify project is selected in Google Cloud Console

### Error: "access_denied"

**Problem**: User denied permission or app not verified

**Solution**:

1. Click "Advanced" > "Go to Lumio (unsafe)" if in testing
2. Add user to test users list if in testing mode
3. Complete app verification for production
4. Check required scopes are added

### Sync Not Working

**Problem**: Events not syncing between calendars

**Solution**:

1. Check connection status in Settings > Integrations
2. Disconnect and reconnect
3. Check browser console for errors
4. Verify API is enabled in Google Cloud
5. Check token expiry (refreshes automatically)
6. Manual sync: Click "Sync Google" button

### Token Expired

**Problem**: "401 Unauthorized" errors

**Solution**:

- Tokens refresh automatically
- If persistent, disconnect and reconnect
- Check `refreshToken` is saved in database

## 📊 Monitoring & Logs

### Check Integration Status

```sql
-- In database
SELECT * FROM integration_connections
WHERE integration_id = 'google-calendar'
AND user_id = 'YOUR_USER_ID';
```

### Check Sync Logs

- Backend logs show sync operations
- Look for "Google Calendar sync completed"
- Error logs show specific failures

### API Usage

- Google Cloud Console > APIs & Services > Dashboard
- Monitor quota usage
- Google Calendar API quota: 1,000,000 requests/day

## 🎓 Best Practices

1. **Environment Variables**

   - Never commit credentials to git
   - Use separate credentials for dev/production
   - Rotate secrets periodically

2. **User Communication**

   - Explain what permissions are needed
   - Show sync status clearly
   - Provide disconnect option

3. **Error Handling**

   - Graceful degradation if sync fails
   - Retry logic with exponential backoff
   - User notifications for sync issues

4. **Performance**

   - Sync incrementally (only changed events)
   - Use webhooks for real-time updates
   - Batch operations when possible

5. **Security**
   - Encrypted token storage
   - HTTPS only in production
   - Validate webhook signatures
   - User-scoped data access

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Lumio Calendar Documentation](./CALENDAR_FEATURES.md)

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client credentials created
- [ ] Environment variables set
- [ ] Server restarted
- [ ] OAuth flow tested (can connect)
- [ ] Sync to Google tested (Lumio → Google)
- [ ] Sync from Google tested (Google → Lumio)
- [ ] Error handling verified
- [ ] Production URLs configured (if deploying)

---

## Quick Reference

```bash
# Environment Variables
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# OAuth Redirect URI
https://yourdomain.com/api/integrations/google-calendar/callback

# Required Scopes
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.readonly
```

**🚀 Ready to sync calendars like a pro!**
