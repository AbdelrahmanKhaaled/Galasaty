# Login Issue Debugging Guide

## Changes Made

1. **Fixed Content-Type Header Conflict**
   - Removed default `Content-Type: application/json` from axios instance
   - Explicitly set `Content-Type: application/x-www-form-urlencoded` for login requests
   - Changed `formData` to `formData.toString()` to ensure proper serialization

2. **Improved Error Handling**
   - Added comprehensive error logging in console
   - Better error messages to identify the root cause
   - Handles network errors, CORS errors, and server errors separately

3. **Enhanced Debugging**
   - Console logs for login response structure
   - Logs for token extraction process
   - Detailed error information

## Common Issues and Solutions

### 1. Network Error (CORS Issue)
If you see "Network Error", it's likely a CORS (Cross-Origin Resource Sharing) issue.

**Solution**: The API server needs to allow requests from your frontend origin. You can:
- Add CORS headers on the backend server
- Use a Vite proxy (see below)

### 2. Vite Proxy Configuration (for CORS)
Add this to `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://galasaty.teamqeematech.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

Then change API_BASE_URL to `/api` in development.

### 3. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab: See if the request is being sent and what response you get
- Console tab: Check for error messages and logs

### 4. Verify API Response Format
The login API might return data in different formats:
- `{ token: "...", user: {...} }`
- `{ data: { token: "...", user: {...} } }`
- `{ access_token: "...", user: {...} }`

Check the console logs to see what format your API returns.

## Testing Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check the console logs for:
   - "Login response:" - shows the full API response
   - "Extracted token:" - shows if token was found
   - Any error messages

5. Go to Network tab:
   - Find the `/login` request
   - Check the Request Headers
   - Check the Response (if any)
   - Check Status Code

## Expected API Response Format

Based on the Postman collection, the API should return something like:
```json
{
  "token": "1|...",
  "user": {
    "id": 1,
    "name": "...",
    "email": "..."
  }
}
```

Or wrapped in a `data` property:
```json
{
  "data": {
    "token": "1|...",
    "user": {...}
  }
}
```





