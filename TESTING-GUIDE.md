# Facebook Conversions API Testing Guide

## 🧪 Test Event Code: `TEST92674`

Your test event code has been configured in `.env` file. All events sent in development will be tagged with this code and appear in the **Test Events** tab in Facebook Events Manager.

---

## ⚠️ IMPORTANT: Add Your Pixel ID First

Before testing, you **MUST** add your Facebook Pixel ID to the `.env` file:

```bash
# Edit line 38 in .env:
NEXT_PUBLIC_FB_PIXEL_ID="YOUR_PIXEL_ID_HERE"
```

**Without the Pixel ID, events won't be sent to Facebook!**

---

## 🧪 Testing Methods

### **Method 1: Manual Testing (Recommended)**

Test each event type by performing the actual actions on your website:

#### **Test 1: PageView Event** (Client-Side)

1. **Action**: Visit your homepage
   ```
   http://localhost:3000
   ```

2. **What to Check**:
   - Open Browser DevTools → Network tab
   - Look for request to `facebook.com/tr`
   - Should see `ev=PageView`

3. **Verify in Facebook**:
   - Go to Events Manager → Test Events tab
   - Should see `PageView` event appear within 30 seconds

---

#### **Test 2: InitiateCheckout Event** (Client-Side)

1. **Action**: Click a pricing button
   ```
   1. Go to http://localhost:3000
   2. Scroll to pricing section
   3. Click "Get Started" or "Get Lifetime Deal" button
   ```

2. **What to Check**:
   - Browser console should log the event
   - Network tab shows Facebook pixel request

3. **Verify in Facebook**:
   - Events Manager → Test Events
   - Should see `InitiateCheckout` with:
     - Content name: "Lifetime Plan" or "STARTER Monthly Plan"
     - Value: 39, 10, or 19 (depending on plan)
     - Currency: USD

---

#### **Test 3: Lead Event** (Server-Side)

1. **Action**: Submit contact form
   ```
   You'll need to have a contact page, or use API directly:

   POST http://localhost:3000/api/contact
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test@example.com",
     "subject": "Test Subject",
     "message": "This is a test message for Facebook event tracking"
   }
   ```

2. **What to Check**:
   - Server logs should show:
     ```
     ✅ Facebook Conversion Event tracked: Lead
        eventsReceived: 1
        eventId: 1761468444-abc123def456
     ```

3. **Verify in Facebook**:
   - Events Manager → Test Events
   - Should see `Lead` event with:
     - Email (hashed)
     - Client IP
     - User Agent
     - Content name: "Contact Form: Test Subject"

---

#### **Test 4: CompleteRegistration Event** (Server-Side)

1. **Action**: Register a new account
   ```
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json

   {
     "email": "testuser@example.com",
     "password": "testpassword123",
     "name": "Test User"
   }
   ```

2. **What to Check**:
   - Server logs should show:
     ```
     ✅ Facebook Conversion Event tracked: CompleteRegistration
        eventsReceived: 1
        eventId: 1761468444-xyz789
     ```

3. **Verify in Facebook**:
   - Events Manager → Test Events
   - Should see `CompleteRegistration` event with:
     - Email (hashed)
     - External ID (user ID, hashed)
     - Registration method: "email"

---

#### **Test 5: Purchase Event** (Server-Side + Client-Side)

**Note**: This requires completing a PayPal payment flow. Use PayPal sandbox for testing.

1. **Action**: Complete a lifetime purchase
   ```
   1. Click "Get Lifetime Deal" button
   2. Complete PayPal sandbox payment
   3. Get redirected back to your site
   ```

2. **What to Check**:
   - Server logs should show:
     ```
     ✅ Facebook Conversion Event tracked: Purchase
        eventsReceived: 1
        eventId: 1761468444-purchase123
     ```
   - Browser should also fire client-side Purchase event

3. **Verify in Facebook**:
   - Events Manager → Test Events
   - Should see `Purchase` event with:
     - Value: "39.00" (as string)
     - Currency: "USD"
     - Email (hashed)
     - Transaction ID
     - Content name: "Lifetime Access"

---

#### **Test 6: Subscribe Event** (Server-Side + Client-Side)

1. **Action**: Complete a subscription payment
   ```
   1. Click "Get Started" on Starter or Professional plan
   2. Complete PayPal sandbox subscription
   3. Get redirected back
   ```

2. **What to Check**:
   - Server logs should show:
     ```
     ✅ Facebook Conversion Event tracked: Subscribe
        eventsReceived: 1
        eventId: 1761468444-subscribe123
     ```

3. **Verify in Facebook**:
   - Events Manager → Test Events
   - Should see `Subscribe` event with:
     - Value: "10.00", "8.00", "19.00", or "15.00"
     - Currency: "USD"
     - Subscription plan name
     - Predicted LTV

---

### **Method 2: API Testing with cURL**

For quick server-side testing without UI:

#### **Test Lead Event**:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test from cURL",
    "message": "Testing Facebook Conversions API"
  }'
```

#### **Test CompleteRegistration Event**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "testpass123",
    "name": "New Test User"
  }'
```

---

### **Method 3: Graph API Explorer (Facebook's Tool)**

As shown in your screenshot, you can also test using Facebook's Graph API Explorer:

1. **Click "Graph API Explorer" button** in the Facebook setup page
2. **Make sure all parameters match** what's shown in the payload
3. **Submit the test**
4. **Return to Test Events page** to verify

---

## 📊 **Verifying Events in Facebook**

### **Step 1: Open Test Events Tab**

```
1. Go to: https://business.facebook.com/events_manager
2. Click on "Test Events" tab (top navigation)
3. Keep this page open while testing
```

### **Step 2: What to Look For**

Each event should show:

✅ **Event Name**: Purchase, Lead, CompleteRegistration, etc.
✅ **Event Time**: Should be recent (within last minute)
✅ **Test Event Code**: TEST92674
✅ **Event Parameters**:
  - Event ID (for deduplication)
  - Event Source URL
  - Action Source: "website"

✅ **Customer Information**:
  - Email (shows as "Matched" when hashed correctly)
  - External ID (shows as "Matched")
  - Client IP Address
  - Client User Agent
  - Browser ID (fbp)
  - Click ID (fbc) - if available

✅ **Custom Data** (for Purchase/Subscribe):
  - Value (as string, e.g., "39.00")
  - Currency: "USD"

---

## 🔍 **Troubleshooting**

### **Events Not Appearing?**

**Check 1: Pixel ID**
```bash
# Make sure it's set in .env
grep NEXT_PUBLIC_FB_PIXEL_ID .env

# Should NOT be "your-facebook-pixel-id-here"
```

**Check 2: Access Token**
```bash
# Make sure it's set
grep FB_CONVERSION_API_TOKEN .env

# Should be a long string starting with "EAA..."
```

**Check 3: Test Event Code**
```bash
# Make sure it's set
grep FB_TEST_EVENT_CODE .env

# Should be: TEST92674
```

**Check 4: Server Running**
```bash
# Make sure dev server is running
# Should show: ✓ Ready in XXXms
```

**Check 5: Browser Console**
```
Open DevTools → Console
Look for any JavaScript errors
```

**Check 6: Server Logs**
```
Look for:
  ✅ Facebook Conversion Event tracked: [EventName]

Or errors:
  ❌ Facebook Conversions API Error: [error message]
```

---

### **Low Event Match Quality?**

If Facebook shows low match quality in Test Events:

**Check these are being sent**:
- ✅ Email (should show as "Matched")
- ✅ External ID (should show as "Matched")
- ✅ Client IP Address (should show as "Matched")
- ✅ Client User Agent (should show as "Matched")
- ✅ fbp cookie (should show as "Matched")
- ✅ fbc cookie (may not always be present)

**If any show as "Not Matched"**:
1. Check server logs to see what data is being sent
2. Verify the data is being hashed correctly (email, external_id)
3. Ensure cookies are being set (check browser DevTools → Application → Cookies)

---

### **Duplicate Events?**

If you see the same event twice:

**This is EXPECTED** for Purchase and Subscribe events:
- One event from server-side API
- One event from browser pixel
- Facebook automatically deduplicates them using `event_id`

**Check deduplication is working**:
- Look at event details in Test Events
- Should show "Deduplicated" or matching event_id

---

## ✅ **Testing Checklist**

Before marking testing complete, verify:

```
□ Pixel ID added to .env
□ Access Token added to .env
□ Test Event Code added to .env (TEST92674)
□ Dev server restarted after .env changes

Client-Side Events:
□ PageView event fires on page load
□ InitiateCheckout fires when clicking pricing
□ Purchase fires on payment success page (client-side)

Server-Side Events:
□ Lead event fires on contact form submit
□ CompleteRegistration fires on user signup
□ Purchase event fires after lifetime payment (server-side)
□ Subscribe event fires after subscription payment (server-side)

Facebook Verification:
□ All events appear in Test Events tab
□ Events show TEST92674 test code
□ Event match quality is good (green/yellow, not red)
□ Customer information fields show "Matched"
□ Purchase events include value and currency
□ Events are deduplicated (no duplicates in Test Events)
```

---

## 🚀 **Going to Production**

Once testing is complete and all events are working:

### **Step 1: Remove Test Event Code**

For production, remove or comment out the test event code:

```bash
# In .env file, comment out or remove:
# FB_TEST_EVENT_CODE="TEST92674"
```

Or update your code to only use test code in development.

### **Step 2: Update Pixel ID for Production**

Make sure you're using the correct Pixel ID for your production Facebook account.

### **Step 3: Deploy**

Deploy your code to production and verify events appear in:
- Events Manager → **Overview** tab (not Test Events)

### **Step 4: Monitor Event Match Quality**

After 24-48 hours of live data:
1. Check Events Manager → Data Quality
2. Target: 8.0+ out of 10 match quality
3. Our implementation should achieve 8.5-9.5

---

## 📚 **Resources**

- **Test Events**: https://business.facebook.com/events_manager → Test Events tab
- **Event Debugging**: Use browser DevTools → Network tab
- **Server Logs**: Check terminal where `npm run dev` is running
- **Facebook Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api

---

## 🆘 **Need Help?**

If events still aren't working:

1. Check all items in the troubleshooting section
2. Review server logs for error messages
3. Verify payload structure matches Facebook requirements
4. Check `FACEBOOK-CONVERSIONS-API-SETUP.md` for detailed setup info

---

**Ready to test?** 🧪

1. ✅ Add your Pixel ID to `.env` (if not already done)
2. ✅ Restart dev server (or just reload page)
3. ✅ Open Facebook Events Manager → Test Events tab
4. ✅ Perform test actions on your site
5. ✅ Watch events appear in real-time!
