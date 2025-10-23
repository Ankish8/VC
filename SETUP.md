# VectorCraft Setup Guide

## PayPal Subscription Setup

### 1. Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app or use an existing one
3. Copy your **Client ID** and **Secret**

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # or "live" for production

# Optional: If you already have a PayPal product
# PAYPAL_PRODUCT_ID=your_product_id_here
```

### 3. Create PayPal Subscription Plans

Run this command to automatically create all subscription plans in PayPal:

```bash
npm run setup:plans
```

This will:
- Create 4 subscription plans in PayPal (Starter Monthly, Starter Yearly, Pro Monthly, Pro Yearly)
- Save the plan IDs to your database
- Display all the created plan IDs

### 4. Verify Setup

1. The script will show you all the created plan IDs
2. These are automatically saved to your database
3. You can also view/edit them in the admin panel at `/admin/pricing`

## Troubleshooting

### "Failed to get PayPal access token"
- Check that your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
- Make sure `PAYPAL_MODE` is set to `sandbox` for testing

### "PayPal create product error"
- If you get a duplicate product error, you can:
  1. Find your existing product ID in PayPal Dashboard
  2. Add it to your `.env.local` as `PAYPAL_PRODUCT_ID`
  3. Run the script again

### Plans already exist
- If you've already created plans, you can manually update them in the admin panel
- Or you can create new plans and update the database

## Database Management

Useful database commands:

```bash
# View/edit database in browser
npm run db:studio

# Push schema changes to database
npm run db:push
```

## Admin Access

To access the admin panel:
1. Go to `/admin/pricing`
2. Login with your admin account
3. View and update pricing/plan settings
