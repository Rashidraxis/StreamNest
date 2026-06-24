# 🎬 StreamNest

A full-stack video streaming platform built with Spring Boot and Angular 19.

## Tech Stack

**Backend:**
- Java 17 + Spring Boot 3.5
- Spring Security + JWT Authentication
- Spring Data JPA + PostgreSQL (Supabase)
- FFmpeg for HLS video processing
- Cloudflare R2 for video storage

**Frontend:**
- Angular 19 (Zoneless + Signals)
- HLS.js for adaptive video streaming
- Role-based access (ADMIN/USER)

## Features

- 🔐 JWT Authentication with role-based access
- 📹 Video upload with FFmpeg HLS conversion
- 🎬 Adaptive HLS streaming via Cloudflare R2
- 🖼️ Auto-generated video thumbnails
- 🔍 Video search
- 🗑️ Admin video management

## Setup

### Backend
1. Clone the repo
2. Copy `src/main/resources/application.properties.example` to `application.properties`
3. Fill in your credentials
4. Run `./mvnw spring-boot:run`

### Frontend
1. `cd frontend`
2. `npm install`
3. `ng serve --proxy-config proxy.conf.json`

## Architecture

```
Angular Frontend → Spring Boot API → PostgreSQL (Supabase)
                                   → Cloudflare R2 (Videos)
                                   → FFmpeg (Processing)
```