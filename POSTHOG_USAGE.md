# PostHog Usage Guide

PostHog is now integrated into your VectorCraft application with session replay enabled!

## 🎯 What's Included

- ✅ Session Replay (records user interactions, console logs, network requests)
- ✅ Automatic page view tracking
- ✅ Autocapture (clicks, form submissions, changes)
- ✅ Custom event tracking
- ✅ User identification
- ✅ Feature flags support
- ✅ Privacy controls (input masking, selective recording)

## 🔧 Configuration

PostHog is configured in `/src/components/providers/PostHogProvider.tsx` with:

### Session Replay Settings
- **Input Masking**: All inputs are masked by default (passwords, credit cards)
- **Console Logs**: Captured for debugging
- **Network Requests**: Recorded (headers + body)
- **Performance**: Web Vitals tracked
- **Canvas**: Disabled for better performance

### Privacy Controls
You can exclude specific elements from recording:

```html
<!-- Don't capture this element at all -->
<div className="ph-no-capture">Sensitive content</div>
<div data-ph-no-capture>Sensitive content</div>

<!-- Mask the text in this element -->
<div className="ph-mask-text">123-45-6789</div>
<div data-ph-mask>Credit card info</div>

<!-- Ignore changes to this element -->
<div className="ph-ignore">Frequently updating content</div>
```

## 📊 Usage Examples

### 1. Track User Login
```typescript
import { identifyUser } from '@/lib/posthog';

// After successful login
identifyUser(user.id, {
  email: user.email,
  name: user.name,
  plan: user.subscriptionTier,
  createdAt: user.createdAt,
});
```

### 2. Track Custom Events
```typescript
import { trackEvent } from '@/lib/posthog';

// Track image conversion
trackEvent('image_converted', {
  inputFormat: 'png',
  outputFormat: 'svg',
  fileSize: 1024000,
  conversionTime: 2.5,
});

// Track subscription
trackEvent('subscription_purchased', {
  plan: 'pro',
  price: 29.99,
  billingCycle: 'monthly',
});
```

### 3. Update User Properties
```typescript
import { setUserProperties } from '@/lib/posthog';

// Update user info when they change their plan
setUserProperties({
  plan: 'enterprise',
  credits: 1000,
  lastActive: new Date().toISOString(),
});
```

### 4. Handle Logout
```typescript
import { resetPostHog } from '@/lib/posthog';

// Clear user identification on logout
async function handleLogout() {
  await signOut();
  resetPostHog();
}
```

### 5. Control Session Recording
```typescript
import { stopSessionRecording, startSessionRecording } from '@/lib/posthog';

// Stop recording on sensitive pages
function PrivacyPage() {
  useEffect(() => {
    stopSessionRecording();
    return () => startSessionRecording();
  }, []);
}
```

### 6. Feature Flags
```typescript
import { isFeatureEnabled, getFeatureFlag } from '@/lib/posthog';

// Check if feature is enabled
if (isFeatureEnabled('new-editor')) {
  return <NewEditor />;
}

// Get feature flag variant
const variant = getFeatureFlag('pricing-test');
if (variant === 'variant-a') {
  return <PricingA />;
}
```

## 🎨 Recommended Events to Track

### Core Conversion Events
```typescript
// Image conversion workflow
trackEvent('conversion_started', { format: 'png' });
trackEvent('conversion_completed', {
  format: 'png',
  quality: 'high',
  processingTime: 3.2
});
trackEvent('conversion_failed', {
  error: 'timeout',
  format: 'png'
});

// Downloads
trackEvent('svg_downloaded', { format: 'svg' });
trackEvent('batch_download', { count: 5 });
```

### User Engagement
```typescript
trackEvent('image_uploaded', { fileSize: 2048000 });
trackEvent('settings_changed', { theme: 'dark' });
trackEvent('tutorial_completed', { step: 5 });
trackEvent('feedback_submitted', { rating: 5 });
```

### Monetization
```typescript
trackEvent('subscription_viewed');
trackEvent('subscription_started');
trackEvent('subscription_completed', { plan: 'pro', amount: 29.99 });
trackEvent('subscription_cancelled', { reason: 'too-expensive' });
trackEvent('credits_purchased', { amount: 100, price: 9.99 });
```

### Errors & Issues
```typescript
trackEvent('error_occurred', {
  errorType: 'api_failure',
  endpoint: '/api/convert',
  statusCode: 500,
});

trackEvent('rate_limit_hit', {
  userId: user.id,
  endpoint: '/api/convert'
});
```

## 🔍 Viewing Session Replays

1. Go to your PostHog dashboard: https://app.posthog.com
2. Navigate to "Session Replay" in the left sidebar
3. Filter by user, date, or events
4. Click on a session to watch the replay

### Tips for Session Replay
- **Link to events**: Click on any event in the timeline to jump to that moment
- **Console logs**: View console errors that occurred during the session
- **Network tab**: See all API calls and their responses
- **Performance**: Check page load times and Web Vitals
- **User flow**: Watch exactly how users navigate your app

## 🚀 Production Deployment

When deploying to production, add these environment variables to Vercel:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_Oq8NuxV5OeyJknCvxP7KVkqCPp8dvoXqk1uK1YpgK42
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Considerations for Production

1. **Sampling**: If you have high traffic, consider sampling recordings:
   ```typescript
   // In PostHogProvider.tsx
   session_recording: {
     sampling: {
       minimumDuration: 5000, // Only record sessions > 5 seconds
       // Optionally add: sampleRate: 0.5 to record 50% of sessions
     }
   }
   ```

2. **Privacy Compliance**: Ensure you have proper consent mechanisms
3. **Performance**: Session replay adds ~50KB to your bundle (lazy-loaded)
4. **Data Retention**: Configure in PostHog settings (default: 21 days for replays)

## 📚 Resources

- [PostHog Docs](https://posthog.com/docs)
- [Next.js Integration](https://posthog.com/docs/libraries/next-js)
- [Session Replay Docs](https://posthog.com/docs/session-replay)
- [Feature Flags](https://posthog.com/docs/feature-flags)
- [Event Tracking Best Practices](https://posthog.com/docs/product-analytics/capturing-events)

## 🎯 Next Steps

1. Start your dev server and test PostHog is loading (check browser console)
2. Navigate around your app and perform some actions
3. Go to PostHog dashboard and view your first session replay!
4. Add custom event tracking to key user actions
5. Set up user identification on login/signup
