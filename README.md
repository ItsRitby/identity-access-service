[README.md](https://github.com/user-attachments/files/33359962/README.md)
# identity-access-service

Identity and Access microservice for the **muCARD** platform — a multiplayer card games system.

Covers user stories **US-1 to US-6** of the project:

| Code | User Story |
|------|------------|
| US-1 | Register a new user |
| US-2 | Authenticate a user |
| US-3 | Recover a password using a recovery code |
| US-4 | View the authenticated user's profile |
| US-5 | Change the account nickname |
| US-6 | Log out |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | JavaScript (Node.js 20, ES Modules) |
| HTTP framework | Express |
| Database | Couchbase Community Edition 7.2 |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| API docs | Swagger / OpenAPI 3.0 (`swagger-jsdoc` + `swagger-ui-express`) |
| Containerization | Docker + Docker Compose (multi-stage build) |
| Service discovery | Spring Eureka (planned integration) |
| API Gateway | Spring Cloud Gateway (planned integration) |

---

## Architecture

The service follows a classic layered architecture with DTOs separating the contract from internal entities.

```
HTTP request
    ↓
Routes         →  path + method + middlewares
    ↓
Middlewares    →  JWT auth, error handler
    ↓
Controllers    →  parse request DTO, call service, format response DTO
    ↓
Services       →  business rules
    ↓
Repositories   →  Couchbase access (KV + N1QL)
    ↓
Couchbase      →  documents keyed as `user::<uuid>`
```

---

## Project Structure

```
identity-access-service/
├── docker-compose.yml          # Couchbase + init service + microservice
├── Dockerfile                  # Multi-stage Node.js build
├── init-couchbase.sh           # Automated cluster/bucket/scope/collection setup
├── package.json
├── .env.example                # Environment variable template
├── .gitignore
├── .dockerignore
├── docs/
│   └── openapi.json            # Exported OpenAPI spec
├── postman/
│   ├── identity-access-service.postman_collection.json
│   └── muCARD-Identity-Local.postman_environment.json
└── src/
    ├── app.js                  # Express application (middlewares + routes)
    ├── server.js               # Entry point (connects Couchbase, ensures indexes, listens)
    ├── config/
    │   ├── database.js         # Couchbase connection (bucket, scope, collection)
    │   ├── indexes.js          # N1QL index creation (idempotent)
    │   └── swagger.js          # OpenAPI definition
    ├── controllers/
    │   ├── authController.js   # US-2, US-3, US-6
    │   └── userController.js   # US-1, US-4, US-5
    ├── dtos/
    │   ├── requests/
    │   │   ├── registerUserRequestDTO.js
    │   │   ├── loginRequestDTO.js
    │   │   ├── recoverPasswordRequestDTO.js
    │   │   └── changeNicknameRequestDTO.js
    │   └── responses/
    │       ├── userResponseDTO.js
    │       ├── registerUserResponseDTO.js
    │       ├── loginResponseDTO.js
    │       ├── recoverPasswordResponseDTO.js
    │       └── logoutResponseDTO.js
    ├── middlewares/
    │   ├── authMiddleware.js   # JWT verification
    │   └── errorHandler.js     # Centralized error responses
    ├── models/
    │   └── userModel.js        # User document factory
    ├── repositories/
    │   └── userRepository.js   # Couchbase KV + N1QL operations
    ├── routes/
    │   ├── authRoutes.js
    │   └── userRoutes.js
    ├── services/
    │   ├── authService.js      # Login, recovery, logout logic
    │   └── userService.js      # Register, profile, nickname logic
    └── utils/
        ├── AppError.js         # Custom error classes with HTTP status codes
        ├── passwordUtils.js    # bcrypt hash / verify
        ├── tokenUtils.js       # JWT sign / verify
        └── recoveryCodeUtils.js
```

---

## Getting Started

### Prerequisites

- **Docker Desktop** (running)
- **Node.js 20+** only if you want to run outside Docker
- **Postman** (optional, for API testing)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/identity-access-service.git
cd identity-access-service
```

### 2. Set up environment variables

Copy the template:

```bash
cp .env.example .env
```

Edit `.env` and adjust the values. **Never commit `.env`.**

### 3. Start everything with Docker Compose

```bash
docker compose up -d --build
```

This single command:

1. Builds the Node.js image.
2. Starts the Couchbase container.
3. Runs `couchbase-init` (idempotent cluster + bucket + scope + collection setup).
4. Starts the microservice once Couchbase is healthy.

**First startup takes 90–120 seconds** because Couchbase initializes from scratch. Subsequent startups take 20–40 s.

### 4. Verify

```bash
docker ps
docker logs identity-access-service
```

Expected output:

```
Couchbase connected -> bucket 'identity_access', scope 'identity', collection 'users'
Index ensured: CREATE INDEX idx_users_username ...
Index ensured: CREATE INDEX idx_users_nickname ...
identity-access-service listening on port 3001
```

Test the service:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

### 5. Stop the stack

```bash
docker compose down
```

Add `-v` to also wipe the Couchbase volume (all data):

```bash
docker compose down -v
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express server port |
| `NODE_ENV` | `development` | Runtime environment |
| `COUCHBASE_CONNECTION_STRING` | `couchbase://localhost` | Use `couchbase://couchbase` inside Docker |
| `COUCHBASE_USERNAME` | `Administrator` | Couchbase admin user |
| `COUCHBASE_PASSWORD` | `changeme123` | Couchbase admin password |
| `COUCHBASE_BUCKET` | `identity_access` | Bucket name |
| `COUCHBASE_SCOPE` | `identity` | Scope name |
| `COUCHBASE_COLLECTION` | `users` | Collection name |
| `JWT_SECRET` | — | **Must be ≥ 16 chars.** Generate with `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` | Token lifetime (e.g. `15m`, `1h`, `7d`) |

---

## API Endpoints

Base URL: `http://localhost:3001`

| # | Method | Endpoint | Auth | Request DTO | Response DTO | US |
|---|--------|----------|------|-------------|--------------|-----|
| 1 | `POST` | `/api/v1/users` | Public | `RegisterUserRequestDTO` | `RegisterUserResponseDTO` | US-1 |
| 2 | `POST` | `/api/v1/auth/login` | Public | `LoginRequestDTO` | `LoginResponseDTO` | US-2 |
| 3 | `POST` | `/api/v1/auth/recover-password` | Public | `RecoverPasswordRequestDTO` | `RecoverPasswordResponseDTO` | US-3 |
| 4 | `GET` | `/api/v1/users/me` | Bearer JWT | — | `UserResponseDTO` | US-4 |
| 5 | `PUT` | `/api/v1/users/me/nickname` | Bearer JWT | `ChangeNicknameRequestDTO` | `UserResponseDTO` | US-5 |
| 6 | `POST` | `/api/v1/auth/logout` | Bearer JWT | — | `LogoutResponseDTO` | US-6 |

### Request / Response shapes

**Register (US-1) — request**
```json
{
  "username": "playerone",
  "nickname": "TheChosen",
  "password": "secret123"
}
```

**Register (US-1) — response `201`**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "playerone",
    "nickname": "TheChosen",
    "gamesPlayed": 0,
    "wins": 0,
    "currentStreak": 0,
    "createdAt": "2026-10-12T15:00:00.000Z"
  },
  "recoveryCode": "AB12-CD34-EF56"
}
```
> The `recoveryCode` is shown **only once**. Store it securely.

**Login (US-2) — response `200`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "username": "playerone", "...": "..." }
}
```

**Error response (any 4xx/5xx)**
```json
{
  "error": "ConflictError",
  "message": "Username is already taken"
}
```

---

## API Documentation (Swagger)

Once the service is running, the interactive Swagger UI is available at:

```
http://localhost:3001/api-docs
```

The raw OpenAPI 3.0 spec is available at:

```
http://localhost:3001/api-docs.json
```

A snapshot is also committed at `docs/openapi.json`.

---

## Testing with Postman

1. Import the collection: `postman/identity-access-service.postman_collection.json`.
2. Import the environment: `postman/muCARD-Identity-Local.postman_environment.json`.
3. Select the environment in Postman.
4. Run requests in order:

   1. **Register User** — saves `recoveryCode` automatically.
   2. **Register duplicate** — expects `409`.
   3. **Login** — saves `token` automatically.
   4. **Get Current User**
   5. **Change Nickname**
   6. **Recover Password** — uses and refreshes `recoveryCode`.
   7. **Login with new password** — refreshes `token`.
   8. **Logout**

---

## Design Decisions

- **DTOs everywhere.** Controllers never touch raw documents. Requests are validated by request DTOs; responses are shaped by response DTOs. `passwordHash` and `recoveryCode` never leak.
- **UUID v4 for user ids.** No sequential ids; no coordination needed; safe for distributed systems.
- **Couchbase key = `user::<uuid>`.** Prefix allows filtering by type and readability.
- **N1QL queries use `RequestPlus` scan consistency.** Guarantees read-after-write for username and nickname uniqueness checks, at a small latency cost.
- **JWT is stateless.** `POST /logout` returns a confirmation and acts as an extension point; the client discards the token. Token validity is bounded by `JWT_EXPIRES_IN`.
- **Recovery code regenerates on password recovery.** Each code is single-use.
- **Multi-stage Dockerfile.** Final image contains only production dependencies and `src/`.

---

## Known Limitations

- **Logout does not invalidate the token server-side.** JWT is stateless. In production, use short-lived access tokens + refresh tokens, or a revocation blocklist.
- **No email/notification channel.** The recovery code is returned to the client at registration and after each recovery — the user must store it themselves.
- **Single-node Couchbase.** No replication, no clustering. Adequate for development.
- **CORS is permissive (`origin: true`).** Restrict to specific origins in production.

---

## Related Modules

This microservice is part of the **muCARD** platform and is designed to be registered with a **Spring Eureka** server and consumed through a **Spring Cloud Gateway**. The gateway routes `/identity/**` to this service by its application name `identity-access-service`.

---

## Authors

- **UPTC — Ingeniería de Software II**
- Project: muCARD — 2026
