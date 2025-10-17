# HubSpot Integration Test Guide

> **Purpose:** Step-by-step guide to test HubSpot integration  
> **Time Required:** ~20 minutes  
> **Prerequisites:** HubSpot account (free tier works)

---

## 1. Create Test Account

### 1.1 Sign Up for HubSpot Free

```
1. Go to: https://app.hubspot.com/signup
2. Fill in:
   - Email: your-test-email@domain.com
   - First name: Test
   - Last name: User
   - Company name: Lumio Test Company
3. Click "Create account"
4. Verify email
5. Complete onboarding wizard (skip if possible)
```

**Result:** You should now have access to HubSpot Free CRM

---

## 2. Get API Access

### 2.1 Create Private App

```
1. In HubSpot, click ⚙️ (Settings) → Integrations
2. In left sidebar, scroll to "Integrations"
3. Click "Private Apps"
4. Click "Create a private app"
5. Fill in:
   Name: Lumio Integration Test
   Description: Test integration for Lumio platform
6. Click "Scopes" tab
7. Select these permissions:
   ☑️ crm.objects.contacts.read
   ☑️ crm.objects.contacts.write
   ☑️ crm.objects.deals.read
   ☑️ crm.objects.deals.write
   ☑️ crm.objects.companies.read
   ☑️ crm.objects.companies.write
8. Click "Create app"
9. Click "Continue creating"
10. COPY the Access Token (starts with "pat-na1-...")
```

**⚠️ IMPORTANT:** Save this token somewhere safe. It's only shown once!

---

## 3. Connect in Lumio

### 3.1 OAuth Connection

```
1. In Lumio, go to: Dashboard → Settings → Integrations
2. Find "HubSpot" card
3. Click "Connect" button
4. Popup opens with HubSpot OAuth
5. Login if needed
6. Click "Authorize"
7. Popup closes → back to Lumio
8. You should see "Connected ✓"
```

**Expected Result:**

- Status changes to "Connected"
- Green badge appears
- "Last Sync" shows "Just now"

### 3.2 Manual Token (Alternative)

If OAuth fails, use manual connection:

```
1. Click "Connect Manually" instead
2. Paste your Access Token
3. Click "Test Connection"
4. Should show ✓ "Connection successful"
5. Click "Save & Activate"
```

---

## 4. Test Data Sync

### 4.1 Create Test Contact in HubSpot

```
1. In HubSpot, go to: Contacts → Contacts
2. Click "Create contact"
3. Fill in:
   Email: test-lead-1@example.com
   First name: John
   Last name: TestLead
   Company: Test Corp
   Phone: +1-555-0100
   Lifecycle stage: Lead
4. Click "Create"
```

### 4.2 Trigger Sync in Lumio

```
1. In Lumio: Settings → Integrations → HubSpot
2. Click "Sync Now" button
3. Wait ~10-30 seconds
```

### 4.3 Verify in Leads Page

```
1. Go to: Dashboard → Leads
2. Use source filter: Select "HubSpot"
3. Look for "John TestLead"
```

**Expected Result:**

- Lead appears in table
- Source shows HubSpot badge 🟠
- Email: test-lead-1@example.com
- Company: Test Corp
- Score: Auto-calculated

---

## 5. Test Webhook (Real-Time Sync)

### 5.1 Configure Webhook in HubSpot

```
1. HubSpot Settings → Integrations → Private Apps
2. Click your "Lumio Integration Test" app
3. Go to "Webhooks" tab
4. Click "Create subscription"
5. Configure:
   Target URL: https://your-lumio-domain.com/api/webhooks/hubspot
   Events:
     ☑️ contact.creation
     ☑️ contact.propertyChange
     ☑️ deal.creation
6. Click "Create subscription"
```

### 5.2 Test Real-Time Sync

```
1. In HubSpot, create another contact:
   Email: test-lead-2@example.com
   First name: Jane
   Last name: WebhookTest
2. Wait 5-10 seconds
3. In Lumio, go to Leads page
4. Refresh if needed
5. Look for "Jane WebhookTest"
```

**Expected Result:**

- Lead appears within 10 seconds (no manual sync needed!)
- Source: HubSpot
- Badge shows sync time

### 5.3 Test Property Update

```
1. In HubSpot, edit John TestLead
2. Change phone to: +1-555-0200
3. Save
4. Wait 10 seconds
5. In Lumio Leads, find John TestLead
6. Phone should update to +1-555-0200
```

---

## 6. Test Bi-Directional Sync

### 6.1 Create Lead in Lumio

```
1. In Lumio Leads page
2. Click "Add Lead"
3. Fill in:
   First name: Sarah
   Last name: LumioTest
   Email: sarah-test@example.com
   Company: Lumio Corp
   Source: (select "Lumio" or leave default)
4. Save
```

### 6.2 Verify in HubSpot

```
1. Go to HubSpot → Contacts
2. Search for "sarah-test@example.com"
3. Should appear within 30 seconds
```

**Expected Result:**

- Contact created in HubSpot
- All fields mapped correctly
- Custom property "lumio_lead_score" populated

---

## 7. Verify Data Integrity

### 7.1 Check Field Mapping

```
Lead in Lumio          →  Contact in HubSpot
--------------------      -------------------
firstName              →  firstname
lastName               →  lastname
email                  →  email
company                →  company
phone                  →  phone
score                  →  hs_lead_score (custom)
source                 →  lead_source
```

### 7.2 Test Edge Cases

**Test 1: Duplicate Email**

```
1. Try creating lead with existing email
2. Should update existing instead of creating duplicate
```

**Test 2: Special Characters**

```
1. Create contact with name: "José Müller"
2. Verify special characters preserved
```

**Test 3: Missing Fields**

```
1. Create contact with only email
2. Should work (other fields optional)
```

---

## 8. Performance Testing

### 8.1 Batch Sync

```
1. In HubSpot, import CSV with 100 test contacts
2. In Lumio, trigger "Sync Now"
3. Monitor progress
4. Measure time
```

**Expected Performance:**

- 100 contacts: ~30-60 seconds
- Progress indicator shows %
- No errors

### 8.2 Rate Limiting

```
1. Trigger multiple syncs rapidly
2. Should queue gracefully
3. No "429 Too Many Requests" errors
```

---

## 9. Error Handling

### 9.1 Test Invalid Token

```
1. Settings → Integrations → HubSpot
2. Click "Configure"
3. Change token to invalid value
4. Click "Test Connection"
```

**Expected Result:**

- Shows "Connection failed" error
- Clear error message
- Option to retry or reconnect

### 9.2 Test Network Error

```
1. Disconnect internet
2. Try to sync
3. Reconnect internet
```

**Expected Result:**

- Shows "Network error" message
- Auto-retries when connection restored
- Queue preserved

---

## 10. Cleanup Test Data

### 10.1 Delete Test Contacts

**In HubSpot:**

```
1. Go to Contacts
2. Select all test contacts (test-lead-*, *Test*)
3. Click Actions → Delete
4. Confirm
```

**In Lumio:**

```
1. Go to Leads
2. Filter by "HubSpot" source
3. Select test leads
4. Click "Delete"
5. Confirm
```

### 10.2 Disconnect Integration (Optional)

```
1. Settings → Integrations → HubSpot
2. Click "Disconnect"
3. Confirm
4. Status should show "Not Connected"
```

---

## Troubleshooting Common Issues

### Issue: "Connection Failed"

**Cause:** Invalid or expired token

**Solution:**

```
1. Regenerate token in HubSpot
2. Copy new token
3. Update in Lumio
4. Test connection
```

### Issue: "Webhook Not Receiving Events"

**Cause:** Webhook not configured or URL incorrect

**Solution:**

```
1. Verify webhook URL in HubSpot
2. Check webhook logs in HubSpot
3. Test webhook manually: POST to webhook URL
4. Check Lumio logs: /api/webhooks/hubspot
```

### Issue: "Some Contacts Not Syncing"

**Cause:** Filters or permissions

**Solution:**

```
1. Check sync filters in Lumio
2. Verify token has required scopes
3. Check if contacts exist in HubSpot
4. View sync logs for specific errors
```

---

## Success Checklist

✅ All test items passed:

- [ ] Created HubSpot test account
- [ ] Generated Private App token
- [ ] Connected via OAuth in Lumio
- [ ] Manual sync works (created contact appears)
- [ ] Webhook configured
- [ ] Real-time sync works (new contact appears automatically)
- [ ] Bi-directional sync works (Lumio → HubSpot)
- [ ] Field mapping correct
- [ ] Batch sync performs well
- [ ] Error handling graceful
- [ ] Test data cleaned up

---

## Next Steps

After successful testing:

1. ✅ Connect your production HubSpot account
2. ✅ Run initial full sync
3. ✅ Configure field mappings for custom fields
4. ✅ Set up sync schedule (default: 30 min)
5. ✅ Enable webhooks for real-time sync
6. ✅ Configure SDR Agent rules for HubSpot leads
7. ✅ Monitor health dashboard regularly

---

## Support

**Issues?** Contact: support@lumio.com  
**Documentation:** [HubSpot Integration Guide](./HUBSPOT_INTEGRATION.md)  
**Status:** [HubSpot API Status](https://status.hubspot.com)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained by:** Lumio Integrations Team
