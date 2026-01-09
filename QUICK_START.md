# Quick Start Guide

Fastest way to get the system running.

## TL;DR

```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL databases
createdb cloud_api && createdb local_api

# 3. Create .env files (see below)

# 4. Setup databases
npm run setup

# 5. Run both apps (in separate terminals)
npm run cloud-api:dev    # Terminal 1
npm run local-api:dev    # Terminal 2
```

## Environment Files

**`apps/cloud-api/.env`**:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloud_api?schema=public"
```

**`apps/local-api/.env`**:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/local_api?schema=public"
CLOUD_API_URL="http://localhost:3000"
```

**⚠️ Replace `postgres:postgres` with your actual PostgreSQL credentials!**

## Verify It's Working

```bash
# Test Cloud API
curl http://localhost:3000/api/restaurants

# Test Local API
curl http://localhost:3001/api/tablets
```

Both should return `[]` (empty arrays).

## Next Steps

- See `HOW_TO_RUN.md` for detailed instructions
- See `SETUP.md` for testing the activation flow
- See `README.md` for architecture details
