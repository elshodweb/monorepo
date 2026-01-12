# Setup Guide

## Quick Start

## !!! Some guards (for example, @UseGuards(SignatureGuard)) are commented out to allow Swagger to work correctly.

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Databases

**Prerequisites**: PostgreSQL must be installed and running.

```bash
# Create PostgreSQL databases
createdb cloud_api
createdb local_api

# Or using psql:
# psql -U postgres -c "CREATE DATABASE cloud_api;"
# psql -U postgres -c "CREATE DATABASE local_api;"
```

### 3. Configure Environment Variables

```bash
# Copy environment example files
cp apps/cloud-api/.env.example apps/cloud-api/.env
cp apps/local-api/.env.example apps/local-api/.env

# Edit the .env files with your PostgreSQL credentials
# Update DATABASE_URL in both files:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 4. Run Database Migrations

```bash
# Generate Prisma clients and run migrations
cd apps/cloud-api
npx prisma generate
npx prisma migrate dev --name init

cd ../local-api
npx prisma generate
npx prisma migrate dev --name init

cd ../..
```

### 5. Start Applications

**Terminal 1 - Cloud API:**
```bash
npm run cloud-api:dev
```

**Terminal 2 - Local API:**
```bash
npm run local-api:dev
```

## Testing the Flow

### Step 1: Create a Restaurant

```bash
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Restaurant",
    "address": "123 Main Street"
  }'
```

**Response:**
```json
{
  "id": "clx...",
  "name": "My Restaurant",
  "address": "123 Main Street",
  "activation_secret": "ABC123XYZ789DEF456",
  "message": "Restaurant created. Save the activation_secret - it will not be shown again."
}
```

**⚠️ IMPORTANT:** Save the `activation_secret` - you'll need it in the next step!

### Step 2: Activate Local API

```bash
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "activation_secret": "ABC123XYZ789DEF456"
  }'
```

**Response:**
```json
{
  "server_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Local API activated successfully"
}
```

The Local API will:
- Generate an Ed25519 key pair
- Store the private key in `.local-api-config.json` and database
- Send the public key to Cloud API
- Receive and store the `server_id`

### Step 3: Create a Tablet

```bash
curl -X POST http://localhost:3001/api/tablets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablet 1"
  }'
```

**Response:**
```json
{
  "id": "clx...",
  "tablet_id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Tablet 1",
  "activation_code": "ABC12345",
  "expires_at": "2024-01-01T12:10:00.000Z",
  "message": "Tablet created. Activation code expires in 10 minutes."
}
```

**⚠️ IMPORTANT:** Save the `activation_code` - it expires in 10 minutes!

### Step 4: Activate Tablet

First, generate a key pair (you can use Node.js):

```javascript
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);
```

Then activate:

```bash
curl -X POST http://localhost:3001/api/tablets/activate \
  -H "Content-Type: application/json" \
  -d '{
    "activation_code": "ABC12345",
    "public_key": "-----BEGIN PUBLIC KEY-----\n..."
  }'
```

**Response:**
```json
{
  "tablet_id": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Tablet activated successfully"
}
```

### Step 5: Make Signed Requests

#### Tablet → Local API

```bash
# Generate signature
TIMESTAMP=$(date +%s000)
METHOD="GET"
PATH="/api/tablets"
BODY=""
PAYLOAD="${METHOD}${PATH}${BODY}${TIMESTAMP}"

# Sign with tablet's private key
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -sign tablet_private_key.pem | base64)

curl -X GET http://localhost:3001/api/tablets \
  -H "X-Tablet-Id: 660e8400-e29b-41d4-a716-446655440001" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE"
```

#### Local API → Cloud API

The Local API automatically signs requests when making calls to Cloud API (if configured with HttpClientService).

## Troubleshooting

### "Missing required headers" error
- Ensure all three headers are present: `X-Server-Id`/`X-Tablet-Id`, `X-Timestamp`, `X-Signature`
- Check header names are exact (case-sensitive)

### "Invalid signature" error
- Verify the payload construction: `method + path + body + timestamp`
- Ensure private key matches the stored public key
- Check that body is JSON stringified (empty string if no body)

### "Request timestamp is too old" error
- Check system clock synchronization
- Ensure timestamp is in milliseconds (not seconds)
- Max drift is 5 minutes

### "Server not found or not activated" error
- Verify the server/tablet is activated
- Check that `server_id`/`tablet_id` exists in database
- Ensure public key is stored

### Database errors
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env files is correct
- Ensure databases exist: `cloud_api` and `local_api`
- Ensure Prisma migrations have run
- Run `npx prisma generate` if schema changed
- Check PostgreSQL connection: `psql -U postgres -d cloud_api` and `psql -U postgres -d local_api`

## Development Notes

- PostgreSQL databases must be created manually before running migrations
- Private keys are stored in both database and `.local-api-config.json` (for Local API)
- Activation secrets/codes are hashed and never stored in plaintext
- All timestamps use milliseconds (Unix timestamp * 1000)
