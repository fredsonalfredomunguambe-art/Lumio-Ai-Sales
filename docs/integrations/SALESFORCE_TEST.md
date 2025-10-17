# Salesforce Integration Test Guide

> **Purpose:** Step-by-step guide to test Salesforce integration  
> **Time Required:** ~30 minutes  
> **Prerequisites:** Salesforce Developer Edition account

---

## 1. Create Test Account

### 1.1 Sign Up for Salesforce Developer Edition

```
1. Go to: https://developer.salesforce.com/signup
2. Fill in the form:
   - Email: your-email@domain.com
   - First name, Last name
   - Username: must be unique (e.g., yourname-lumio-test@developer.com)
   - Company: Lumio Test
   - Role: Developer
   - Country: Your country
3. Accept terms and click "Sign me up"
4. Check email for activation link
5. Click activation link
6. Set your password
```

**Result:** You now have a free Salesforce Developer Edition org

**Note:** Developer Edition has all Enterprise features for free, perfect for testing!

---

## 2. Get API Access

### 2.1 Create Connected App

```
1. Login to Salesforce
2. Click ⚙️ (Setup) in top right
3. In Quick Find box, type "App Manager"
4. Click "App Manager"
5. Click "New Connected App"
6. Fill in:
   Connected App Name: Lumio Integration
   API Name: Lumio_Integration
   Contact Email: your-email@domain.com

7. Under "API (Enable OAuth Settings)":
   ☑️ Enable OAuth Settings

   Callback URL: https://your-lumio-domain.com/api/integrations/salesforce/oauth/callback

   Selected OAuth Scopes (move to right):
   ☑️ Access and manage your data (api)
   ☑️ Perform requests on your behalf at any time (refresh_token, offline_access)
   ☑️ Access your basic information (id, profile, email, address, phone)

8. Click "Save"
9. Click "Continue"
10. Wait 2-10 minutes for propagation
```

### 2.2 Get Consumer Key and Secret

```
1. After waiting, click "Manage Consumer Details"
2. Verify your identity (email code)
3. COPY:
   - Consumer Key (like: 3MVG9...)
   - Consumer Secret (like: 1234...)
```

### 2.3 Create Security Token

```
1. Click your avatar → Settings
2. In left sidebar: Personal → Reset My Security Token
3. Click "Reset Security Token"
4. Check email for security token
5. COPY the security token
```

**Credentials You Need:**

- Consumer Key (Client ID)
- Consumer Secret (Client Secret)
- Username (your login email)
- Password
- Security Token

---

## 3. Connect in Lumio

### 3.1 OAuth Connection (Recommended)

```
1. Lumio: Settings → Integrations → Salesforce
2. Click "Connect with OAuth"
3. Popup opens
4. Login to Salesforce if needed
5. Click "Allow" to grant permissions
6. Popup closes
7. Back in Lumio → Status: "Connected ✓"
```

### 3.2 Manual Connection (Alternative)

```
1. Click "Connect Manually"
2. Fill in:
   Username: your-salesforce-username
   Password: your-password
   Security Token: your-token
   Is Sandbox: ☑️ No (uncheck)
3. Click "Test Connection"
4. Should show: "✓ Connection successful"
5. Click "Save & Activate"
```

---

## 4. Test Data Sync

### 4.1 Create Test Lead in Salesforce

```
1. In Salesforce, click "Leads" tab
2. Click "New"
3. Fill in:
   First Name: John
   Last Name: SalesforceTest
   Company: Test Industries
   Email: john.sftest@example.com
   Phone: (555) 123-4567
   Lead Status: Open - Not Contacted
   Lead Source: Web
4. Click "Save"
```

### 4.2 Trigger Sync

```
1. In Lumio: Settings → Integrations → Salesforce
2. Click "Sync Now"
3. Select what to sync:
   ☑️ Leads
   ☑️ Opportunities (Deals)
   ☑️ Accounts (Companies)
4. Click "Start Sync"
5. Wait 15-30 seconds
```

### 4.3 Verify in Lumio

```
1. Dashboard → Leads
2. Filter by source: "Salesforce"
3. Look for "John SalesforceTest"
```

**Expected Fields:**

- Name: John SalesforceTest
- Email: john.sftest@example.com
- Company: Test Industries
- Phone: (555) 123-4567
- Source: Salesforce ☁️
- Status: NEW (mapped from Lead Status)

---

## 5. Test Opportunity Sync

### 5.1 Create Opportunity in Salesforce

```
1. In Salesforce, click "Opportunities" tab
2. Click "New"
3. Fill in:
   Opportunity Name: Test Deal - $5000
   Account Name: Create new → "Test Corp"
   Amount: 5000
   Close Date: [30 days from now]
   Stage: Prospecting
4. Click "Save"
```

### 5.2 Verify in Lumio

```
1. Lumio → Insights or Leads (linked to contact)
2. Should see deal value tracked
3. Analytics should reflect $5000 pipeline value
```

---

## 6. Test Bi-Directional Sync

### 6.1 Update Lead in Lumio

```
1. In Lumio Leads, find John SalesforceTest
2. Click to edit
3. Change:
   Status: CONTACTED
   Score: 85
   Notes: "Interested in premium plan"
4. Save
```

### 6.2 Verify in Salesforce

```
1. Go to Salesforce → Leads
2. Open "John SalesforceTest"
3. Check if:
   - Lead Status: Working - Contacted (or similar)
   - Custom field "Lumio Score": 85
   - Notes/Comments: Updated
```

**Note:** Bi-directional sync may take up to 30 min without webhooks

---

## 7. Test Enterprise Features

### 7.1 Bulk Operations

```
1. In Salesforce Data Loader or import:
   - Import 50+ test leads
2. In Lumio:
   - Trigger sync
   - Wait for completion
3. Verify all imported correctly
```

### 7.2 Custom Fields

```
1. In Salesforce Setup → Object Manager → Lead
2. Create custom field: "Customer_Priority__c" (picklist: High, Medium, Low)
3. In Lumio → Integrations → Salesforce → Field Mapping
4. Map custom field to Lumio field
5. Test sync with custom field populated
```

---

## 8. Performance Benchmarks

### Expected Performance

| Operation         | Expected Time | Your Result |
| ----------------- | ------------- | ----------- |
| OAuth Connection  | <10 seconds   | **\_**      |
| Single Lead Sync  | <5 seconds    | **\_**      |
| Batch 100 Leads   | <60 seconds   | **\_**      |
| Webhook Latency   | <10 seconds   | **\_**      |
| Field Update Sync | <30 seconds   | **\_**      |

### If Performance is Slow

**Check:**

- Network connection
- Salesforce API limits (not exceeded)
- Lumio server status
- Number of custom fields (more fields = slower)

---

## 9. Error Scenarios

### 9.1 Test Invalid Credentials

```
1. Change password in Salesforce
2. DON'T update in Lumio
3. Try to sync
```

**Expected:**

- Error message: "Invalid credentials"
- Status: Error
- Option to "Reconnect"

### 9.2 Test API Limit

Salesforce has API limits (5,000 calls/day for Developer Edition)

```
1. Make many sync requests rapidly
2. Should handle gracefully
3. Queue subsequent requests
4. Show: "Rate limit reached, retrying..."
```

---

## 10. Advanced Testing

### 10.1 SOQL Queries

Lumio uses SOQL to query Salesforce:

```
Test query in Salesforce Developer Console:
SELECT Id, FirstName, LastName, Email, Company, Phone, Status
FROM Lead
WHERE Email LIKE '%test%'
ORDER BY CreatedDate DESC
LIMIT 10
```

Should return your test leads.

### 10.2 Bulk API

For large data volumes, Lumio uses Bulk API 2.0:

```
Test: Import 1000+ leads
Expected: Uses Bulk API automatically
Verify: Check logs for "Using Bulk API"
```

---

## Cleanup

### Remove Test Data

**Salesforce:**

```
1. Leads → List View → All Leads
2. Filter: Email contains "test"
3. Select all
4. Delete
```

**Lumio:**

```
1. Leads page
2. Filter: Source = Salesforce
3. Select test leads
4. Bulk delete
```

### Disconnect (Optional)

```
1. Settings → Integrations → Salesforce
2. Click "Disconnect"
3. In Salesforce Setup → Connected Apps
4. Revoke Lumio Integration access
```

---

## Success Checklist

- [ ] Created Salesforce Developer Edition account
- [ ] Created Connected App
- [ ] Got Consumer Key, Secret, Security Token
- [ ] Connected via OAuth
- [ ] Manual sync works
- [ ] Leads sync correctly
- [ ] Opportunities sync correctly
- [ ] Bi-directional sync works
- [ ] Custom fields map correctly
- [ ] Bulk operations perform well
- [ ] Error handling works
- [ ] Test data cleaned up

---

## Production Deployment

After successful testing:

1. ✅ Create production Connected App (same steps)
2. ✅ Use production credentials
3. ✅ Run initial full sync (may take hours for large datasets)
4. ✅ Enable incremental sync
5. ✅ Configure field mappings
6. ✅ Set up sync schedule
7. ✅ Monitor health dashboard

---

## Useful Resources

- [Salesforce Developer Org Limits](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet)
- [OAuth Web Server Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm)
- [Salesforce APIs](https://developer.salesforce.com/docs/apis)
- [Bulk API 2.0](https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/bulk_api_2_0.htm)

---

**Support:** support@lumio.com  
**Last Updated:** January 2025  
**Version:** 1.0.0
