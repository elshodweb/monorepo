# How to Run the System

Complete step-by-step guide to set up and run both Cloud API and Local API.

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **PostgreSQL 12+** installed and running ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# From the monorepo root directory
npm install
```

This installs all dependencies for both applications and shared packages.

### Step 2: Create PostgreSQL Databases

Make sure PostgreSQL is running, then create the databases:

```bash
# Option 1: Using createdb command (if you have it in PATH)
createdb cloud_api
createdb local_api

# Option 2: Using psql
psql -U postgres -c "CREATE DATABASE cloud_api;"
psql -U postgres -c "CREATE DATABASE local_api;"

# Option 3: Interactive psql
psql -U postgres
CREATE DATABASE cloud_api;
CREATE DATABASE local_api;
\q
```

**Note**: Adjust the username (`postgres`) if your PostgreSQL setup uses a different user.

### Step 3: Configure Environment Variables

Create `.env` files for both applications:

#### Create `apps/cloud-api/.env`:

```bash
# On Windows (PowerShell)
New-Item -Path "apps\cloud-api\.env" -ItemType File

# On Linux/Mac
touch apps/cloud-api/.env
```

Add this content (adjust credentials as needed):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloud_api?schema=public"
```

#### Create `apps/local-api/.env`:

```bash
# On Windows (PowerShell)
New-Item -Item -Path "apps\local-api\.env" -ItemType File

# On Linux/Mac
touch apps/local-api/.env
```

Add this content:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/local_api?schema=public"
CLOUD_API_URL="http://localhost:3000"
```

**Important**: Replace `postgres:postgres` with your actual PostgreSQL username and password.

### Step 4: Generate Prisma Clients and Run Migrations

**Option 1: Using convenience script (recommended)**

```bash
# From monorepo root - sets up both apps
npm run setup
```

**Option 2: Manual setup**

```bash
# Cloud API
cd apps/cloud-api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Local API
cd apps/local-api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

This will:

- Generate Prisma Client for type-safe database access
- Create all necessary database tables

### Step 5: Run the Applications

You need **two terminal windows** to run both applications simultaneously.

#### Terminal 1 - Cloud API:

```bash
# From monorepo root
npm run cloud-api:dev
```

You should see:

```
Cloud API is running on http://localhost:3000
```

#### Terminal 2 - Local API:

```bash
# From monorepo root
npm run local-api:dev
```

You should see:

```
Local API is running on http://localhost:3001
```

## Verify Everything is Working

### Test Cloud API:

```bash
curl http://localhost:3000/api/restaurants
```

Should return: `[]` (empty array, which is correct for a new database)

### Test Local API:

```bash
curl http://localhost:3001/api/tablets
```

Should return: `[]` (empty array)

## Quick Test Flow

### 1. Create a Restaurant (Cloud API)

```bash
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"name": "My Restaurant", "address": "123 Main St"}'
```

**Save the `activation_secret` from the response!**

### 2. Activate Local API

```bash
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{"activation_secret": "YOUR_ACTIVATION_SECRET_HERE"}'
```

### 3. Create a Tablet (Local API)

```bash
curl -X POST http://localhost:3001/api/tablets \
  -H "Content-Type: application/json" \
  -d '{"name": "Tablet 1"}'
```

**Save the `activation_code` from the response!**

### 4. Activate Tablet

```bash
curl -X POST http://localhost:3001/api/tablets/activate \
  -H "Content-Type: application/json" \
  -d '{
    "activation_code": "YOUR_ACTIVATION_CODE_HERE",
    "public_key": "-----BEGIN PUBLIC KEY-----\nYOUR_PUBLIC_KEY_HERE\n-----END PUBLIC KEY-----"
  }'
```

## Troubleshooting

### "Cannot connect to PostgreSQL"

- Ensure PostgreSQL is running:
  ```bash
  # Check if PostgreSQL is running
  psql -U postgres -c "SELECT version();"
  ```
- Verify your `DATABASE_URL` in `.env` files is correct
- Check PostgreSQL is listening on the correct port (default: 5432)

### "Module not found" errors

- Run `npm install` again from the root directory
- Ensure you're in the monorepo root when running commands

### "Prisma Client not generated"

- Run `npx prisma generate` in each app directory
- Check that `node_modules` exists in both app directories

### Port already in use

- Cloud API uses port **3000**
- Local API uses port **3001**
- Change ports in `apps/*/src/main.ts` if needed, or stop other services using these ports

### Migration errors

- Ensure databases exist: `psql -U postgres -l` should list `cloud_api` and `local_api`
- Check database permissions
- Try resetting: `npx prisma migrate reset` (⚠️ deletes all data)

## Production Build

To build for production:

```bash
# Build all packages and apps
npm run build

# Start Cloud API (production)
npm run cloud-api:start

# Start Local API (production)
npm run local-api:start
```

## Development vs Production

- **Development**: Uses `npm run *:dev` - auto-reloads on file changes
- **Production**: Uses `npm run *:start` - optimized build, no auto-reload

## Next Steps

Once both APIs are running:

1. Read `SETUP.md` for detailed API usage examples
2. Read `README.md` for architecture and security details
3. Test the complete activation flow
4. Implement your tablet client to make signed requests

## Windows-Specific Notes

If you're on Windows and `createdb` doesn't work:

1. Add PostgreSQL bin directory to PATH, or
2. Use full path: `"C:\Program Files\PostgreSQL\15\bin\createdb.exe" cloud_api`
3. Or use pgAdmin GUI to create databases

## Environment Variable Format

The `DATABASE_URL` format is:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Examples:

- Local: `postgresql://postgres:postgres@localhost:5432/cloud_api?schema=public`
- Remote: `postgresql://user:pass@db.example.com:5432/cloud_api?schema=public`
