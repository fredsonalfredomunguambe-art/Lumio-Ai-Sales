# Mailchimp Integration Test Guide

> **Purpose:** Test Mailchimp email marketing integration  
> **Time Required:** ~15 minutes  
> **Prerequisites:** Mailchimp account (free tier works)

---

## 1. Create Test Account

### 1.1 Sign Up for Mailchimp

```
1. Go to: https://mailchimp.com/signup
2. Fill in:
   - Email: your-email@domain.com
   - Username: choose username
   - Password: strong password
3. Verify email
4. Complete profile setup
```

**Free Tier Includes:**

- Up to 500 contacts
- 1,000 emails/month
- Basic templates
- Perfect for testing!

---

## 2. Get API Access

### 2.1 Generate API Key

```
1. Login to Mailchimp
2. Click your profile icon → Account & Billing
3. In left sidebar: Settings → Extras → API keys
4. Scroll to "Your API keys"
5. Click "Create A Key"
6. Name it: "Lumio Integration Test"
7. Click "Generate Key"
8. COPY the API key (like: abc123def456...)
```

**⚠️ IMPORTANT:** Save immediately! Key is only shown once.

### 2.2 Find Server Prefix

Your API key tells you the server prefix:

```
If key is: abc123def456-us14
Server prefix is: us14

Common prefixes: us1, us2, us3, ..., us21
```

---

## 3. Connect in Lumio

### 3.1 Manual Connection

```
1. Lumio: Settings → Integrations → Mailchimp
2. Click "Connect"
3. Fill in:
   API Key: [paste your key]
   Server Prefix: [e.g., us14]
4. Click "Test Connection"
5. Should show: "✓ Connection successful"
6. Click "Save"
```

**Expected Result:**

- Status: Connected
- Shows: "Last Sync: Just now"
- Green badge

---

## 4. Create Test Audience

### 4.1 In Mailchimp

```
1. Go to: Audience → All contacts
2. Click "Create Audience" (if first time)
3. Fill in basic info:
   Audience name: Lumio Test Audience
   Default From email: your-email@domain.com
   Default From name: Test Sender
4. Click "Save"
```

### 4.2 Add Test Contacts

```
1. In Audience → All contacts
2. Click "Add contacts" → "Add a subscriber"
3. Fill in:
   Email: test1@example.com
   First name: John
   Last name: MailchimpTest
4. Click "Subscribe"
5. Repeat for 2-3 more test contacts
```

---

## 5. Test Audience Sync

### 5.1 Sync to Lumio

```
1. In Lumio: Settings → Integrations → Mailchimp
2. Click "Sync Now"
3. Select:
   ☑️ Audiences (Lists)
   ☑️ Contacts
4. Click "Start Sync"
5. Wait 10-30 seconds
```

### 5.2 Verify in Leads

```
1. Dashboard → Leads
2. Filter by source: "Mailchimp"
3. Should see your test contacts:
   - John MailchimpTest
   - Other test contacts
```

**Expected Fields:**

- Email from Mailchimp
- Name from Mailchimp
- Source: Mailchimp 🐵
- Tags: Mailchimp audience name

---

## 6. Test Campaign Sync

### 6.1 Create Test Campaign in Mailchimp

```
1. Mailchimp → Campaigns
2. Click "Create Campaign"
3. Choose "Email"
4. Select "Regular" campaign
5. Fill in:
   Campaign name: Test Campaign
   To: Your test audience
   From: Your verified email
   Subject: Test Email from Lumio Integration
6. Design simple email (use template)
7. Click "Save & Close" (don't send yet)
```

### 6.2 Sync Campaigns to Lumio

```
1. Lumio: Settings → Integrations → Mailchimp
2. Sync Now → Select "Campaigns"
3. Wait
4. Go to: Dashboard → Campaigns
5. Filter by integration or search
```

**Expected:**

- Campaign "Test Campaign" appears
- Status: DRAFT
- Type: EMAIL_SEQUENCE
- Shows audience count

---

## 7. Test Bi-Directional Sync

### 7.1 Add Lead in Lumio

```
1. Lumio → Leads → Add Lead
2. Fill in:
   First name: Sarah
   Last name: LumioTest
   Email: sarah.test@example.com
   Tags: "mailchimp-sync"
3. Click "Add to Mailchimp"
4. Select audience
5. Save
```

### 7.2 Verify in Mailchimp

```
1. Mailchimp → Audience → All contacts
2. Search: sarah.test@example.com
3. Should appear within 30-60 seconds
```

---

## 8. Test Webhook (Optional)

### 8.1 Configure Webhook in Mailchimp

```
1. Mailchimp → Account → Settings
2. Extras → Webhooks
3. Click "Create New Webhook"
4. Fill in:
   Callback URL: https://your-lumio-domain.com/api/integrations/mailchimp/webhook
   Events:
     ☑️ Subscribes
     ☑️ Unsubscribes
     ☑️ Profile Updates
     ☑️ Cleaned Emails
5. Click "Save"
```

### 8.2 Test Webhook

```
1. In Mailchimp, update a contact's info
2. Wait 5-10 seconds
3. In Lumio Leads, check if updated
```

---

## 9. Test Segmentation

### 9.1 Create Segment in Mailchimp

```
1. Audience → All contacts
2. Click "Create Segment"
3. Name: "High Value Customers"
4. Add condition: Tag is "vip"
5. Save segment
```

### 9.2 Sync Segment

```
1. Lumio sync should import segment
2. Can use for targeted campaigns
```

---

## 10. Test Email Sending

### 10.1 Send via Lumio (if implemented)

```
1. Create campaign in Lumio
2. Select Mailchimp as delivery method
3. Choose audience
4. Send test
5. Verify received in test email
```

**Expected:**

- Email sends via Mailchimp
- Stats sync back to Lumio
- Open/click tracking works

---

## Performance Testing

### Expected Performance

| Operation         | Expected Time |
| ----------------- | ------------- |
| OAuth Connect     | <10 seconds   |
| Sync 100 contacts | <30 seconds   |
| Sync campaigns    | <20 seconds   |
| Webhook delivery  | <5 seconds    |
| Add contact       | <3 seconds    |

---

## Troubleshooting

### Issue: "Invalid API Key"

**Solution:**

```
1. Verify key copied correctly (no spaces)
2. Check server prefix matches
3. Regenerate key if needed
```

### Issue: "Audience Not Syncing"

**Solution:**

```
1. Check if audience is archived
2. Verify API key has audience permissions
3. Check sync filters
```

### Issue: "Contacts Duplicating"

**Solution:**

```
1. Mailchimp uses email as unique ID
2. Updates should merge, not duplicate
3. Check merge tags configuration
```

---

## Cleanup

```
1. Mailchimp:
   - Audience → Select test contacts → Delete
   - Campaigns → Delete test campaign

2. Lumio:
   - Leads → Filter Mailchimp → Delete test leads
   - Settings → Integrations → Mailchimp → Disconnect (optional)
```

---

## Success Checklist

- [ ] Created Mailchimp account
- [ ] Generated API key
- [ ] Found server prefix
- [ ] Connected in Lumio
- [ ] Audience synced
- [ ] Contacts synced to Leads
- [ ] Campaigns synced
- [ ] Bi-directional sync works
- [ ] Webhook configured (optional)
- [ ] Performance acceptable
- [ ] Test data cleaned

---

## Production Deployment

1. ✅ Use production Mailchimp account
2. ✅ Create production API key
3. ✅ Connect in Lumio
4. ✅ Sync all audiences
5. ✅ Configure field mappings
6. ✅ Set up campaign templates
7. ✅ Enable webhooks for real-time
8. ✅ Configure SDR Agent for Mailchimp subscribers

---

## Resources

- [Mailchimp API Docs](https://mailchimp.com/developer/)
- [API Key Guide](https://mailchimp.com/help/about-api-keys/)
- [Webhook Guide](https://mailchimp.com/developer/guides/sync-audience-data-webhooks/)

---

**Support:** support@lumio.com  
**Last Updated:** January 2025
