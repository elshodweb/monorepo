# Monorepo: Cloud API & Local API

A NestJS monorepo containing two independent backend applications with cryptographic authentication and activation flows.

## Architecture

### Monorepo Structure

```
monorepo/
├── apps/
│   ├── cloud-api/      # Central cloud backend
│   └── local-api/      # Restaurant local backend
├── packages/
│   ├── crypto/         # Shared cryptographic utilities
│   └── shared-types/   # Shared DTOs and interfaces
└── package.json        # Workspace root
```

### Applications

#### Cloud API (Port 3000)
- **Purpose**: Centralized restaurant management and authentication
- **Responsibilities**:
  - Restaurant creation and management
  - One-time activation secret generation
  - Public key storage and verification
  - Signed request verification from Local APIs

#### Local API (Port 3001)
- **Purpose**: Restaurant-local server for tablet management
- **Responsibilities**:
  - Self-activation with Cloud API
  - Tablet creation and activation
  - Signed request verification from tablets
  - Key pair generation and storage

### Shared Packages

#### `@monorepo/crypto`
Cryptographic utilities using Ed25519:
- Key pair generation
- Message signing and verification
- Secret hashing (SHA-256)
- OTP generation

#### `@monorepo/shared-types`
Shared DTOs and interfaces for type safety across applications.

## Security Architecture

### Activation Flow

#### Restaurant Activation (Cloud API → Local API)

1. **Restaurant Creation**:
   - Cloud API generates a one-time activation secret (16-char OTP)
   - Secret is hashed using SHA-256 and stored
   - Original secret is returned **once** and must be saved immediately
   - Restaurant status: `isActivated = false`

2. **Local API Setup**:
   - Local API generates Ed25519 key pair
   - Sends `activation_secret` + `public_key` to Cloud API
   - Cloud API validates secret via hash comparison
   - Cloud API stores public key and assigns `server_id`
   - Activation secret is invalidated (hash set to null)
   - Restaurant status: `isActivated = true`

#### Tablet Activation (Local API → Tablet)

1. **Tablet Creation**:
   - Local API generates 8-char OTP activation code
   - Code is hashed and stored with 10-minute expiration
   - Original code returned to admin

2. **Tablet Activation**:
   - Tablet generates its own Ed25519 key pair
   - Sends `activation_code` + `public_key` to Local API
   - Local API validates code hash and expiration
   - Local API stores tablet public key
   - Activation code is invalidated
   - Tablet status: `isActivated = true`

### Signed Request Verification

#### Cloud API Verification (Local API → Cloud API)

**Headers Required**:
- `X-Server-Id`: Unique server identifier
- `X-Timestamp`: Unix timestamp (milliseconds)
- `X-Signature`: Base64-encoded signature

**Signature Payload**:
```
method + path + body + timestamp
```

**Verification Process**:
1. Extract headers and validate presence
2. Check timestamp drift (max 5 minutes)
3. Retrieve public key by `server_id`
4. Reconstruct payload and verify signature
5. Reject if any step fails

**Implementation**: `SignatureGuard` (NestJS Guard)

#### Local API Verification (Tablet → Local API)

**Headers Required**:
- `X-Tablet-Id`: Unique tablet identifier
- `X-Timestamp`: Unix timestamp (milliseconds)
- `X-Signature`: Base64-encoded signature

**Signature Payload**:
```
method + path + body + timestamp
```

**Verification Process**:
1. Extract headers and validate presence
2. Check timestamp drift (max 5 minutes)
3. Retrieve tablet public key by `tablet_id`
4. Reconstruct payload and verify signature
5. Reject if any step fails

**Implementation**: `TabletSignatureGuard` (NestJS Guard)

## Database Schemas

### Cloud API (PostgreSQL)

```prisma
model Restaurant {
  id                String   @id @default(cuid())
  name              String
  address           String
  activationSecretHash String?  // SHA-256 hash, nullified after activation
  publicKey         String?     // Ed25519 PEM public key
  serverId          String?  @unique
  isActivated       Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Local API (PostgreSQL)

```prisma
model Server {
  id          String   @id @default(cuid())
  serverId    String?  @unique
  publicKey   String
  privateKey  String   // Stored in DB and config file
  isActivated Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tablet {
  id                String   @id @default(cuid())
  name              String
  tabletId          String   @unique
  publicKey         String?
  activationCodeHash String?  // SHA-256 hash, nullified after activation
  activationCodeExpiresAt DateTime?
  isActivated       Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## API Endpoints

### Cloud API

#### `POST /api/restaurants`
Create a new restaurant and receive activation secret.

**Request**:
```json
{
  "name": "Restaurant Name",
  "address": "123 Main St"
}
```

**Response**:
```json
{
  "id": "clx...",
  "name": "Restaurant Name",
  "address": "123 Main St",
  "activation_secret": "ABC123XYZ789...",
  "message": "Restaurant created. Save the activation_secret - it will not be shown again."
}
```

#### `POST /api/restaurants/activate`
Activate a Local API server.

**Request**:
```json
{
  "activation_secret": "ABC123XYZ789...",
  "public_key": "-----BEGIN PUBLIC KEY-----\n..."
}
```

**Response**:
```json
{
  "server_id": "uuid-v4",
  "message": "Restaurant activated successfully"
}
```

#### `GET /api/restaurants` (Protected)
List all restaurants. Requires signed request.

#### `GET /api/restaurants/:id` (Protected)
Get restaurant details. Requires signed request.

### Local API

#### `POST /api/setup`
Activate Local API with Cloud API.

**Request**:
```json
{
  "activation_secret": "ABC123XYZ789..."
}
```

**Response**:
```json
{
  "server_id": "uuid-v4",
  "message": "Local API activated successfully"
}
```

#### `POST /api/tablets`
Create a new tablet and receive activation code.

**Request**:
```json
{
  "name": "Tablet 1"
}
```

**Response**:
```json
{
  "id": "clx...",
  "tablet_id": "uuid-v4",
  "name": "Tablet 1",
  "activation_code": "ABC12345",
  "expires_at": "2024-01-01T12:10:00.000Z",
  "message": "Tablet created. Activation code expires in 10 minutes."
}
```

#### `POST /api/tablets/activate`
Activate a tablet.

**Request**:
```json
{
  "activation_code": "ABC12345",
  "public_key": "-----BEGIN PUBLIC KEY-----\n..."
}
```

**Response**:
```json
{
  "tablet_id": "uuid-v4",
  "message": "Tablet activated successfully"
}
```

#### `GET /api/tablets` (Protected)
List all tablets. Requires signed request from tablet.

#### `GET /api/tablets/:id` (Protected)
Get tablet details. Requires signed request from tablet.

## Security Decisions

### Cryptographic Choices

1. **Ed25519 for Asymmetric Keys**:
   - Fast, secure, small key size
   - Native Node.js crypto support
   - Suitable for high-frequency signing operations

2. **SHA-256 for Secret Hashing**:
   - Industry standard
   - One-way hashing prevents secret recovery
   - Timing-safe comparison prevents timing attacks

3. **Base64 Encoding for Signatures**:
   - HTTP-safe encoding
   - Standard practice for binary data in headers

### Security Measures

1. **One-Time Secrets**:
   - Activation secrets/codes are hashed immediately
   - Original values never stored
   - Invalidated after single use

2. **Timestamp Anti-Replay**:
   - 5-minute drift window prevents replay attacks
   - Clock synchronization required (NTP recommended)

3. **Signature Payload Construction**:
   - Includes method, path, body, and timestamp
   - Prevents method/path tampering
   - Timestamp prevents replay

4. **Private Key Storage**:
   - Local API stores private key in database and config file
   - In production: use secure key management (HSM, AWS KMS, etc.)

### Security Trade-offs

1. **PostgreSQL Database**:
   - ✅ Production-ready, scalable
   - ✅ ACID compliance and transactions
   - ✅ Connection pooling support
   - **Note**: Requires PostgreSQL server running

2. **File-Based Config**:
   - ✅ Simple for local development
   - ❌ Not secure for production
   - **Production**: Use environment variables or secret management

3. **No Key Rotation**:
   - Current implementation doesn't support key rotation
   - **Future**: Implement key rotation with versioning

4. **No Request Nonce**:
   - Timestamp-only replay protection
   - **Future**: Add nonce tracking for stricter replay prevention

## Limitations

1. **No HTTPS Enforcement**:
   - Current implementation doesn't enforce HTTPS
   - **Production**: Use reverse proxy (nginx) with SSL/TLS

2. **No Rate Limiting**:
   - Activation endpoints vulnerable to brute force
   - **Future**: Implement rate limiting (e.g., `@nestjs/throttler`)

3. **No Audit Logging**:
   - No logging of authentication attempts
   - **Future**: Add comprehensive audit logging

4. **Single Database Per App**:
   - No shared database or replication
   - **Production**: Consider database replication for high availability

5. **No Key Escrow/Recovery**:
   - Lost private keys cannot be recovered
   - **Future**: Implement key escrow or recovery mechanism

6. **No Multi-Tenancy**:
   - Each Local API is independent
   - **Future**: Add multi-restaurant support per Local API

## Future Improvements

### Security Enhancements
- [ ] Key rotation mechanism
- [ ] Request nonce tracking
- [ ] Rate limiting on activation endpoints
- [ ] Audit logging for all authentication events
- [ ] HSM integration for key storage
- [ ] Certificate pinning for API-to-API communication

### Operational Improvements
- [ ] Database migration system
- [ ] Health check endpoints
- [ ] Metrics and monitoring (Prometheus)
- [ ] Distributed tracing
- [ ] API versioning
- [ ] Webhook support for events

### Developer Experience
- [ ] OpenAPI/Swagger documentation
- [ ] Integration test suite
- [ ] Docker Compose for local development
- [ ] CI/CD pipeline configuration
- [ ] Development environment setup scripts

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (running and accessible)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma clients
cd apps/cloud-api && npx prisma generate
cd ../local-api && npx prisma generate
cd ../..

# Create PostgreSQL databases
createdb cloud_api
createdb local_api

# Create .env files in each app directory with DATABASE_URL
# apps/cloud-api/.env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloud_api?schema=public"
#
# apps/local-api/.env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/local_api?schema=public"
# CLOUD_API_URL="http://localhost:3000"

# Generate Prisma clients and run migrations
cd apps/cloud-api && npx prisma generate && npx prisma migrate dev --name init
cd ../local-api && npx prisma generate && npx prisma migrate dev --name init
cd ../..
```

### Running Applications

```bash
# Terminal 1: Cloud API
npm run cloud-api:dev

# Terminal 2: Local API
npm run local-api:dev
```

### Example Flow

1. **Create Restaurant** (Cloud API):
   ```bash
   curl -X POST http://localhost:3000/api/restaurants \
     -H "Content-Type: application/json" \
     -d '{"name": "My Restaurant", "address": "123 Main St"}'
   ```
   Save the `activation_secret` from response.

2. **Activate Local API**:
   ```bash
   curl -X POST http://localhost:3001/api/setup \
     -H "Content-Type: application/json" \
     -d '{"activation_secret": "YOUR_ACTIVATION_SECRET"}'
   ```

3. **Create Tablet** (Local API):
   ```bash
   curl -X POST http://localhost:3001/api/tablets \
     -H "Content-Type: application/json" \
     -d '{"name": "Tablet 1"}'
   ```
   Save the `activation_code` from response.

4. **Activate Tablet**:
   ```bash
   curl -X POST http://localhost:3001/api/tablets/activate \
     -H "Content-Type: application/json" \
     -d '{"activation_code": "YOUR_CODE", "public_key": "YOUR_PUBLIC_KEY"}'
   ```

## Development

### Building

```bash
npm run build
```

### Project Structure

Each application follows NestJS conventions:
- `src/main.ts`: Application entry point
- `src/app.module.ts`: Root module
- `src/*.module.ts`: Feature modules
- `src/*.service.ts`: Business logic
- `src/*.controller.ts`: HTTP endpoints
- `src/guards/*.guard.ts`: Authentication/authorization guards
- `prisma/schema.prisma`: Database schema

## License

MIT
