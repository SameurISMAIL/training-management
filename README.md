# Training Management Platform

Full-stack application for managing professional training activities: formations, trainers, participants, domains, structures, profiles, employers, users, and statistics.

The project is split into:
- Backend API: Spring Boot 3 + Spring Security + JWT + MySQL
- Frontend UI: Angular 17 + Angular Material + Charts

## 1) Features

- JWT authentication with role-based access control
- Admin CRUD management for:
  - Formations
  - Formateurs (trainers)
  - Participants
  - Domaines
  - Structures
  - Profils
  - Employeurs
  - Utilisateurs (admin page)
- Dashboard and statistics pages
- Protected Angular routes and secured backend endpoints
- Empty-list endpoints return `200 []` (not `404`) for better frontend behavior

## 2) Tech Stack

Backend:
- Java 17
- Spring Boot 3.3.5
- Spring Web, Spring Data JPA, Spring Security, Validation
- JWT (`jjwt`)
- MySQL

Frontend:
- Angular 17 (standalone components)
- Angular Material
- ng2-charts + chart.js
- RxJS

## 3) Project Structure

```text
POO/
|- src/main/java/com/example/demo
|  |- config
|  |- controller
|  |- dto
|  |- entity
|  |- exception
|  |- repository
|  |- security
|  |- service
|- src/main/resources/application.properties
|- frontend/formation-frontend
|  |- src/app
|  |- package.json
|- pom.xml
```

## 4) Prerequisites

Install the following:
- JDK 17
- Maven 3.9+
- Node.js 18+ (or 20 LTS)
- npm 9+
- MySQL 8+

Check versions:

```bash
java -version
mvn -version
node -v
npm -v
mysql --version
```

## 5) Backend Configuration

Current backend configuration is in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/formation_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
server.port=8080
jwt.secret=change-this-secret-key
jwt.expiration=86400000
```

Notes:
- `createDatabaseIfNotExist=true` auto-creates `formation_db` if it does not exist.
- Change `spring.datasource.username` and `spring.datasource.password` to match your MySQL setup.
- Change `jwt.secret` before production use.

## 6) Initial Seeded Account and Roles

At first startup, backend seeds roles and an admin user:
- Roles:
  - `administrateur`
  - `responsable`
  - `simple utilisateur`
- Default admin login:
  - login: `admin`
  - password: `admin123`

Security mapping converts DB roles to Spring authorities (example: `administrateur` -> `ROLE_ADMIN`).

## 7) Setup and Run (Step by Step)

### Step A - Clone

```bash
git clone https://github.com/SameurISMAIL/training-management.git
cd training-management
```

### Step B - Run Backend (Spring Boot)

From project root:

```bash
mvn clean install
mvn spring-boot:run
```

Backend base URL:
- `http://localhost:8080`

Auth endpoint:
- `POST http://localhost:8080/api/auth/login`

### Step C - Run Frontend (Angular)

Open a second terminal:

```bash
cd frontend/formation-frontend
npm install
npm start
```

Frontend URL:
- `http://localhost:4200`

The frontend services are configured to call backend APIs on `http://localhost:8080/api/...`.

## 8) How to Login

1. Open `http://localhost:4200`
2. Login with:
   - user: `admin`
   - password: `admin123`
3. You should be redirected to dashboard with admin capabilities.

## 9) API Overview

Base path:
- `/api`

Main resources:
- `/api/auth/login`
- `/api/formations`
- `/api/formateurs`
- `/api/participants`
- `/api/domaines`
- `/api/structures`
- `/api/profils`
- `/api/employeurs`
- `/api/admin/utilisateurs`
- `/api/statistiques`

Authorization model:
- `/api/auth/**` is public
- other `/api/**` endpoints require JWT
- many write/admin operations require `ROLE_ADMIN`

## 10) Frontend Route Overview

Public:
- `/login`

Authenticated:
- `/dashboard`
- `/formations`, `/formations/new`, `/formations/:id`, `/formations/:id/edit`
- `/formateurs`, `/formateurs/new`, `/formateurs/:id/edit`
- `/participants`, `/participants/new`, `/participants/:id/edit`

Admin-only (role guard):
- `/domaines`, `/structures`, `/profils`
- `/admin/domaines`, `/admin/structures`, `/admin/profils`
- `/users`, `/admin/users`

Admin or Responsable:
- `/statistiques`

## 11) Build Commands

Backend:

```bash
mvn clean package
```

Frontend:

```bash
cd frontend/formation-frontend
npm run build
```

## 12) Common Troubleshooting

### A) Port 8080 already in use

Windows (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 8080 | Select-Object LocalAddress,LocalPort,State,OwningProcess
Stop-Process -Id <PID> -Force
```

Then restart backend.

### B) MySQL connection fails

- Make sure MySQL server is running.
- Verify `spring.datasource.username` and `spring.datasource.password`.
- Confirm MySQL allows local TCP connections.

### C) 401 / 403 from API

- Login first and ensure JWT token is present.
- Ensure the logged-in user has the required role for the requested operation.

### D) Frontend cannot reach backend

- Backend must run on port 8080.
- Frontend must run on port 4200.
- CORS is configured to allow `http://localhost:4200`.

## 13) Production Readiness Notes

Before deploying publicly, update at least:
- `jwt.secret` (strong, private secret)
- database credentials
- CORS allowed origins
- default seeded credentials
- HTTPS termination and secure runtime configuration

## 14) License

No license file is currently defined. Add a `LICENSE` file if you plan to distribute this project publicly.
