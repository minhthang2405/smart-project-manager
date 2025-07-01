# Railway MySQL Connection Troubleshooting Guide

## Current Issue
The server is failing to connect to MySQL on Railway with `ECONNREFUSED` error.

## Railway MySQL Connection Methods

### Method 1: Internal Private Network (Recommended)
When both services are in the same Railway project, use the internal connection:

```
mysql://user:password@mysql.railway.internal:3306/railway
```

### Method 2: Public Proxy URL
If internal network fails, use the public proxy:

```
mysql://user:password@roundhouse.proxy.rlwy.net:PORT/railway
```

## Steps to Fix

### Step 1: Check Railway Variables
In Railway dashboard, go to your MySQL service and check these variables:
- `MYSQL_URL` (this should be the primary connection string)
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

### Step 2: Add Variable Reference
In your server service on Railway:
1. Go to Variables tab
2. Click "Add Variable Reference"
3. Select MySQL service
4. Choose `MYSQL_URL` variable
5. Name it `DATABASE_URL` in your server

### Step 3: Test Connection Format
Try these connection formats in order:

1. **Internal network** (if both services in same project):
   ```
   mysql://root:password@mysql.railway.internal:3306/railway
   ```

2. **Public proxy** (use the exact port from MySQL variables):
   ```
   mysql://root:password@roundhouse.proxy.rlwy.net:12345/railway
   ```

### Step 4: Debug with Script
Run the debug script locally first to test connection:

```bash
node debug-db-connection.js
```

### Step 5: Railway Logs
Check Railway logs for both services:
- MySQL service logs (check if it's running)
- Server service logs (check connection attempts)

## Common Issues

1. **Wrong port**: Public proxy uses a random port, not 3306
2. **SSL issues**: Railway may require SSL, or it may cause issues
3. **Network access**: Internal network only works within same project
4. **Service startup order**: MySQL must be fully started before server connects

## Environment Variables Format

For Railway, set these in your server service:

```
DATABASE_URL=mysql://username:password@host:port/database
NODE_ENV=production
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
```

## Test Commands

1. **Test locally with Railway DB**:
   ```bash
   # Copy the MYSQL_URL from Railway and test locally
   DATABASE_URL="mysql://..." node debug-db-connection.js
   ```

2. **Test on Railway**:
   ```bash
   # Add debug script to package.json and run on Railway
   "debug-db": "node debug-db-connection.js"
   ```

## Next Steps

1. ✅ Copy exact MYSQL_URL from Railway MySQL service
2. ✅ Add as DATABASE_URL variable reference in server service
3. ✅ Deploy server and check logs
4. ✅ If still failing, try manual connection string with public proxy
5. ✅ If successful, remove debug script and deploy final version
