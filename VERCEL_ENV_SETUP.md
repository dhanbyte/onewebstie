# Vercel Environment Variables Setup

## Step 1: Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select project: `onewebstie` or `ekawabsitemesub-main`

## Step 2: Delete Existing Variables
- Go to Settings → Environment Variables
- DELETE any existing `MONGODB_URI` variable that references secrets
- DELETE all variables that show "Secret" references

## Step 3: Add Fresh Variables

### Secret Variables (Production, Preview, Development):

```
MONGODB_URI
mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/photos-test?retryWrites=true&w=majority&appName=photos-test&connectTimeoutMS=10000&socketTimeoutMS=10000&serverSelectionTimeoutMS=10000

CLERK_SECRET_KEY
sk_test_79pbdZWPLcN5GtX0mUgC6WD6eyzWGOSqkKHGmgP5gg

RAZORPAY_KEY_SECRET
XQOBMTYbX9fRJt6xnkftcNcT

IMAGEKIT_PRIVATE_KEY
private_CbNfu0pqv6SGi5szq+HCP01WZUc=

ADMIN_PASSWORD
9157

VENDOR_SYNC_API_KEY
vendor_sync_key_123
```

### Public Variables (Production, Preview, Development):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
pk_test_YWR2YW5jZWQta29pLTU4LmNsZXJrLmFjY291bnRzLmRldiQ

NEXT_PUBLIC_RAZORPAY_KEY_ID
rzp_live_RKxeb99FKfrsKF

NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
public_wkRNuym4bz+0R6wuAYTQfiaWi90=

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
https://ik.imagekit.io/b5qewhvhb

NEXT_PUBLIC_APP_URL
https://onewebstie.vercel.app

NEXT_PUBLIC_ADMIN_EMAIL
admin@shopwave.social
```

### Other Variables:

```
MONGODB_URI_FALLBACK
mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/photos-test?retryWrites=true&w=majority&appName=photos-test&connectTimeoutMS=3000&socketTimeoutMS=3000&serverSelectionTimeoutMS=3000

MONGODB_DB_NAME
photos-test

ADMIN_USER_IDS
user_2qK8vQ9X2Z3Y4W5V6U7T8S9R0P1Q2R3S,user_admin_default

VENDOR_CENTRAL_API_URL
https://onewebstie.vercel.app

OFFLINE_MODE
false
```

## Important Notes:
- ❌ DO NOT use "Secret" option
- ✅ Paste direct values
- ✅ Select all environments: Production, Preview, Development
- ✅ Save each variable
- ✅ Redeploy after adding all variables

## Step 4: Redeploy
- Go to Deployments tab
- Click "Redeploy" on latest deployment
- Or push new commit to trigger auto-deploy