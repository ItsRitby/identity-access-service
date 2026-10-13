# identity-access-service

Identity and Access microservice for the **muCARD** platform - a multiplayer card games system.

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
| Service Registry | Spring Eureka (`eureka-js-client`) |
| API Gateway | Spring Cloud Gateway (external project) |

---

## Architecture

The service follows a classic layered architecture with DTOs separating the contract from internal entities.

```
HTTP request
    |
    v
Routes         ->  path + method + middlewares
    |
    v
Middlewares    ->  JWT auth, error handler
    |
    v
Controllers    ->  parse request DTO, call service, format response DTO
    |
    v
Services       ->  business rules
    |
    v
Repositories   ->  Couchbase access (KV + N1QL)
    |
    v
Couchbase      ->  documents keyed as `user::<uuid>`
```

### Service discovery flow

```
[ API Gateway ]  -- queries --> [ Eureka Server ]  <-- registers -- [ identity-access-service ]
       |                                                              ^
       |  forwards HTTP                                               |
       +--------------------------------------------------------------+
```

The microservice registers itself with Eureka at startup (if `EUREKA_ENABLED=true`). Eureka becomes the source of truth for its location. The API Gateway queries Eureka to discover the service and forwards requests to it.

**Registration is non-blocking:** if Eureka is unreachable, the microservice logs a warning and keeps serving requests normally.

---

## Project Structure

```
identity-access-service/
|-- docker-compose.yml          # Couchbase + init service + microservice
|-- Dockerfile                  # Multi-stage Node.js build
|-- init-couchbase.sh           # Automated cluster/bucket/scope/collection setup
|-- package.json
|-- .env.example                # Environment variable template
|-- .gitignore
|-- .dockerignore
|-- docs/
|   +-- openapi.json            # Exported OpenAPI spec
|-- postman/
|   |-- identity-access-service.postman_collection.json
|   +-- muCARD-Identity-Local.postman_environment.json
+-- src/
    |-- app.js                  # Express application (middlewares + routes)
    |-- server.js               # Entry point (connects Couchbase, ensures indexes, starts Eureka, listens)
    |-- config/
    |   |-- database.js         # Couchbase connection (bucket, scope, collection)
    |   |-- indexes.js          # N1QL index creation (idempotent)
    |   |-- eureka.js           # Eureka client registration (eureka-js-client)
    |   +-- swagger.js          # OpenAPI definition
    |-- controllers/
    |   |-- authController.js   # US-2, US-3, US-6
    |   +-- userController.js   # US-1, US-4, US-5
    |-- dtos/
    |   |-- requests/
    |   |   |-- registerUserRequestDTO.js
    |   |   |-- loginRequestDTO.js
    |   |   |-- recoverPasswordRequestDTO.js
    |   |   +-- changeNicknameRequestDTO.js
    |   +-- responses/
    |       |-- userResponseDTO.js
    |       |-- registerUserResponseDTO.js
    |       |-- loginResponseDTO.js
    |       |-- recoverPasswordResponseDTO.js
    |       +-- logoutResponseDTO.js
    |-- middlewares/
    |   |-- authMiddleware.js   # JWT verification
    |   +-- errorHandler.js     # Centralized error responses
    |-- models/
    |   +-- userModel.js        # User document factory
    |-- repositories/
    |   +-- userRepository.js   # Couchbase KV + N1QL operations
    |-- routes/
    |   |-- authRoutes.js
    |   +-- userRoutes.js
    |-- services/
    |   |-- authService.js      # Login, recovery, logout logic
    |   +-- userService.js      # Register, profile, nickname logic
    +-- utils/
        |-- AppError.js         # Custom error classes with HTTP status codes
        |-- passwordUtils.js    # bcrypt hash / verify
        |-- tokenUtils.js       # JWT sign / verify
        +-- recoveryCodeUtils.js
```

---

## Getting Started

### Prerequisites

- **Docker Desktop** (running)
- **Node.js 20+** only if you want to run outside Docker
- **Postman** (optional, for API testing)
- **Eureka Server** (optional, for service registration)

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

**First startup takes 90-120 seconds** because Couchbase initializes from scratch. Subsequent startups take 20-40 s.

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
Registered in Eureka as identity-access-service
```

The last line only appears when `EUREKA_ENABLED=true` and an Eureka Server is reachable.

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
| `JWT_SECRET` | - | **Must be >= 16 chars.** Generate with `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` | Token lifetime (e.g. `15m`, `1h`, `7d`) |
| `EUREKA_ENABLED` | `true` | Toggle Eureka registration (`true` / `false`) |
| `EUREKA_HOST` | `localhost` | Eureka Server host. Use `eureka-server` inside Docker |
| `EUREKA_PORT` | `8761` | Eureka Server port |
| `EUREKA_APP_NAME` | `identity-access-service` | Name used to register in Eureka |
| `EUREKA_INSTANCE_HOST` | `localhost` | Host advertised to Eureka for this instance |

---

## API Endpoints

Base URL: `http://localhost:3001`

| # | Method | Endpoint | Auth | Request DTO | Response DTO | US |
|---|--------|----------|------|-------------|--------------|-----|
| 1 | `POST` | `/api/v1/users` | Public | `RegisterUserRequestDTO` | `RegisterUserResponseDTO` | US-1 |
| 2 | `POST` | `/api/v1/auth/login` | Public | `LoginRequestDTO` | `LoginResponseDTO` | US-2 |
| 3 | `POST` | `/api/v1/auth/recover-password` | Public | `RecoverPasswordRequestDTO` | `RecoverPasswordResponseDTO` | US-3 |
| 4 | `GET` | `/api/v1/users/me` | Bearer JWT | - | `UserResponseDTO` | US-4 |
| 5 | `PUT` | `/api/v1/users/me/nickname` | Bearer JWT | `ChangeNicknameRequestDTO` | `UserResponseDTO` | US-5 |
| 6 | `POST` | `/api/v1/auth/logout` | Bearer JWT | - | `LogoutResponseDTO` | US-6 |

### Request / Response shapes

**Register (US-1) - request**
```json
{
  "username": "playerone",
  "nickname": "TheChosen",
  "password": "secret123"
}
```

**Register (US-1) - response `201`**
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

**Login (US-2) - response `200`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "username": "playerone", "...": "..." }
}
```

**Recover password (US-3) - response `200`**
```json
{
  "message": "Password changed successfully",
  "recoveryCode": "XX11-YY22-ZZ33"
}
```
> A new `recoveryCode` is returned. The previous one becomes invalid.

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

   1. **Register User** - saves `recoveryCode` automatically.
   2. **Register duplicate** - expects `409`.
   3. **Login** - saves `token` automatically.
   4. **Get Current User**
   5. **Change Nickname**
   6. **Recover Password** - uses and refreshes `recoveryCode`.
   7. **Login with new password** - refreshes `token`.
   8. **Logout**

---

## Eureka Integration

The microservice registers itself with a Spring Eureka Server using the `eureka-js-client` library.

### How it works

1. On startup (after Couchbase is connected and indexes are ensured), the service calls `startEurekaClient()`.
2. The client sends a registration request to `${EUREKA_HOST}:${EUREKA_PORT}/eureka/apps/`.
3. It sends a heartbeat every 30 seconds to keep the registration alive.
4. On `SIGINT` / `SIGTERM`, the client sends a deregistration request so the Gateway stops routing to it immediately.

### Graceful degradation

If Eureka is unreachable at startup, the client logs a warning and the microservice continues operating. This is intentional: **service registration must not become a single point of failure for the microservice**.

### Disabling Eureka in development

Set `EUREKA_ENABLED=false` in `.env` or as an environment variable. Useful when developing without a running Eureka Server.

### Verifying registration

Open the Eureka console (default: `http://localhost:8761`). Under **"Instances currently registered with Eureka"**, you should see:

```
IDENTITY-ACCESS-SERVICE    n/a (1)    (1)    UP (1) - identity-access-service:identity-access-service:3001
```

---

## Design Decisions

- **DTOs everywhere.** Controllers never touch raw documents. Requests are validated by request DTOs; responses are shaped by response DTOs. `passwordHash` and `recoveryCode` never leak (except at registration and recovery, where the code is intentionally shown once).
- **UUID v4 for user ids.** No sequential ids; no coordination needed; safe for distributed systems.
- **Couchbase key = `user::<uuid>`.** Prefix allows filtering by type and readability.
- **N1QL queries use `RequestPlus` scan consistency.** Guarantees read-after-write for username and nickname uniqueness checks, at a small latency cost.
- **JWT is stateless.** `POST /logout` returns a confirmation and acts as an extension point; the client discards the token. Token validity is bounded by `JWT_EXPIRES_IN`.
- **Recovery code regenerates on password recovery.** Each code is single-use.
- **Multi-stage Dockerfile.** Final image contains only production dependencies and `src/`.
- **Eureka is optional.** Registration is a soft dependency, not a hard one.

---

## Known Limitations

- **Logout does not invalidate the token server-side.** JWT is stateless. In production, use short-lived access tokens + refresh tokens, or a revocation blocklist.
- **No email/notification channel.** The recovery code is returned to the client at registration and after each recovery - the user must store it themselves.
- **Single-node Couchbase.** No replication, no clustering. Adequate for development.
- **CORS is not configured in this microservice.** It is expected to be handled by the API Gateway, which is the only origin seen by browsers. If you need to call this service directly from a browser during development, install the `cors` package and enable it in `src/app.js`.

---

## Related Modules

This microservice is part of the **muCARD** platform. It is designed to:

- Register itself with a **Spring Eureka** server (see the `Eureka Integration` section above).
- Be consumed through a **Spring Cloud Gateway** that routes `/identity/**` to it by application name `identity-access-service`.

The Gateway is a separate Java project. CORS, rate limiting, and unified authentication enforcement are the Gateway's responsibility, not this microservice's.

---

## Authors

- **UPTC - Ingenieria de Software II**
- Project: muCARD - 2026
