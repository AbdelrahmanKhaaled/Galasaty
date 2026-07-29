# CSRF Token Solution

## The Problem

When using the Vite proxy, Laravel treats the request as a same-origin web request and applies CSRF protection. Postman works because it's a different origin or bypasses CSRF checks.

## Solution Implemented

### 1. CSRF Cookie Retrieval ✅
- Added `getCsrfCookie()` function that tries to get CSRF cookie from Laravel Sanctum endpoint
- Falls back to getting cookies from a GET request if Sanctum isn't available
- Only runs in development mode with proxy

### 2. CSRF Token Extraction ✅
- Extracts CSRF token from `XSRF-TOKEN` cookie
- Adds it to the login form data as `_token` field
- Logs whether token was found for debugging

### 3. Cookie Handling ✅
- Enabled `withCredentials: true` in axios to send/receive cookies
- Proxy configured to forward Set-Cookie headers properly
- Removes `Secure` flag and adjusts `SameSite` for localhost

## Alternative Solution (If Above Doesn't Work)

If CSRF token approach doesn't work, the route might need to be accessed differently:

### Option 1: Keep `/api` prefix
If Laravel routes are in `routes/api.php`, they're automatically prefixed with `/api`. 
Change proxy rewrite to NOT remove `/api`:

```typescript
// In vite.config.ts
rewrite: (path) => path, // Don't rewrite, keep /api prefix
```

Then update API_BASE_URL to just use `/api` directly.

### Option 2: Use API route directly
If the login route is in `api.php`, ensure we're hitting `/api/login` on the server:

```typescript
// In src/lib/api.ts
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // This becomes /api/api/login - might need adjustment
  : 'https://galasaty.teamqeematech.site';
```

### Option 3: Backend Configuration
Ask backend developer to:
1. Move login route to `routes/api.php` (doesn't require CSRF)
2. Or exclude login route from CSRF middleware
3. Or configure CORS properly for production

## Testing Steps

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cookies** (important!):
   - Open DevTools → Application → Cookies
   - Clear all cookies for localhost

3. **Try logging in**:
   - Check console for CSRF cookie messages
   - Check if CSRF token is found and added
   - Check Network tab for Set-Cookie headers

4. **If still fails**, check:
   - Browser console for CSRF-related errors
   - Network tab → Headers → Request Headers (check for cookies)
   - Network tab → Headers → Response Headers (check for Set-Cookie)

## Expected Console Output

```
✅ CSRF cookie obtained from Sanctum
✅ CSRF token added to request
API Request: POST /login
✅ API Response: 200 /login
```

Or if Sanctum isn't available:
```
⚠️ Sanctum CSRF endpoint not available, trying alternative methods
✅ CSRF token added to request
```

## Debugging

If CSRF token is not found:
1. Check if cookies are being set (Application → Cookies in DevTools)
2. Check if `XSRF-TOKEN` cookie exists
3. Check proxy logs for Set-Cookie headers
4. Try accessing `/sanctum/csrf-cookie` directly in browser

