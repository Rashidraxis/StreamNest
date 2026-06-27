# 🎬 StreamNest

A full-stack video streaming platform built with two separate backends and one Angular frontend. Demonstrates the same product implemented with different tech stacks.

## 🏗️ Architecture
StreamNest/

├── streaming/        ← Backend 1: Spring Boot + REST API

├── streamnest-api/   ← Backend 2: NestJS + GraphQL API

└── frontend/         ← Angular 19 Frontend

Both backends connect to the same PostgreSQL database and Cloudflare R2 storage. The Angular frontend works with either backend.

## 🚀 Tech Stack

### Backend 1 — Spring Boot
- Java 17 + Spring Boot 3.5
- REST API
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL (Supabase)
- FFmpeg (HLS video processing)
- Cloudflare R2 (video storage)

### Backend 2 — NestJS
- Node.js + TypeScript
- GraphQL (Apollo Server) + REST
- Passport + JWT
- Prisma ORM
- PostgreSQL (Supabase)
- FFmpeg (HLS video processing)
- Cloudflare R2 (video storage)

### Frontend — Angular 19
- Standalone components
- Signals (zoneless change detection)
- HLS.js (adaptive video streaming)
- Role based access (ADMIN/USER)
- JWT authentication

## ✨ Features

- 🔐 JWT Authentication with role based access (ADMIN/USER)
- 📹 Video upload with FFmpeg HLS conversion
- 🎬 Adaptive HLS streaming via Cloudflare R2
- 🖼️ Auto generated video thumbnails
- 🔍 Video search
- 🗑️ Admin video management (upload/delete)
- 📱 Responsive UI

## 🛠️ Setup

### Prerequisites
- Java 17
- Node.js 18+
- FFmpeg installed
- Supabase account (PostgreSQL)
- Cloudflare R2 account

---

### Backend 1 — Spring Boot

```bash
cd streaming
cp src/main/resources/application.properties.example src/main/resources/application.properties
# fill in your credentials
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`

### REST Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/videos` | User | Get all videos |
| GET | `/api/videos/:id` | User | Get single video |
| GET | `/api/videos/search?query=` | User | Search videos |
| POST | `/api/admin/upload` | Admin | Upload video |
| DELETE | `/api/admin/videos/:id` | Admin | Delete video |

---

### Backend 2 — NestJS + GraphQL

```bash
cd streamnest-api
cp .env.example .env
# fill in your credentials
npm install
npm run start:dev
```

Runs on `http://localhost:3000`

GraphQL Playground: `http://localhost:3000/graphql`

### GraphQL Operations

```graphql
# Queries
query { videos { id title thumbnailUrl videoUrl duration status } }
query { video(id: 1) { id title videoUrl } }
query { searchVideos(query: "test") { id title } }
query { health }

# Mutations
mutation { register(input: { name: "John" email: "john@test.com" password: "pass123" }) { token name role } }
mutation { login(input: { email: "john@test.com" password: "pass123" }) { token name role } }
mutation { deleteVideo(id: 1) }
```

### REST Endpoints (same as Spring Boot)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/videos` | User | Get all videos |
| GET | `/api/videos/:id` | User | Get single video |
| GET | `/api/videos/search?query=` | User | Search |
| POST | `/api/videos/upload` | Admin | Upload video |
| DELETE | `/api/videos/:id` | Admin | Delete video |

---

### Frontend — Angular 19

```bash
cd frontend
npm install
ng serve --proxy-config proxy.conf.json
```

Runs on `http://localhost:4200`

By default connects to Spring Boot on port `8080`. To switch to NestJS update `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🔑 Environment Variables

### Spring Boot (`application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://YOUR_SUPABASE_URL
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
jwt.secret=YOUR_JWT_SECRET
r2.access-key=YOUR_R2_ACCESS_KEY
r2.secret-key=YOUR_R2_SECRET_KEY
r2.bucket=YOUR_BUCKET
r2.account-id=YOUR_ACCOUNT_ID
r2.endpoint=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
r2.public-url=https://YOUR_PUBLIC_URL.r2.dev
ffmpeg.path=YOUR_FFMPEG_PATH
ffprobe.path=YOUR_FFPROBE_PATH
```

### NestJS (`.env`)

```env
DATABASE_URL=postgresql://YOUR_SUPABASE_URL
JWT_SECRET=YOUR_JWT_SECRET
R2_ACCESS_KEY=YOUR_R2_ACCESS_KEY
R2_SECRET_KEY=YOUR_R2_SECRET_KEY
R2_BUCKET=YOUR_BUCKET
R2_ACCOUNT_ID=YOUR_ACCOUNT_ID
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://YOUR_PUBLIC_URL.r2.dev
FFMPEG_PATH=YOUR_FFMPEG_PATH
FFPROBE_PATH=YOUR_FFPROBE_PATH
```

---

## 🎯 Why Two Backends?

This project demonstrates the same business logic implemented with different technologies:

| | Spring Boot | NestJS |
|---|---|---|
| Language | Java | TypeScript |
| API Style | REST | GraphQL + REST |
| ORM | JPA/Hibernate | Prisma |
| DI System | Spring IoC | NestJS IoC |
| Auth | Spring Security | Passport |

Key insight — the concepts are identical across both: dependency injection, layered architecture, JWT auth, role based access. Only the syntax and tooling differ.

---

## 📸 Screenshots

*(Add screenshots of your app here)*

---

## 👨‍💻 Author

Built by Rashid Faruqui — Full Stack Developer