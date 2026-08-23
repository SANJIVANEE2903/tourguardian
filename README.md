# TourGuardian 🌍🛡️

**AI-Powered Smart Travel Safety & Assistance Platform**

**Tagline:** _Travel Smart. Stay Safe. Stay Connected._

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

TourGuardian is an industry-level intelligent travel safety and assistance platform designed to protect travelers by combining:

- **AI-Powered Intelligence** - Smart travel planning and risk assessment
- **Real-Time Alerts** - Weather, natural disasters, and safety warnings
- **Emergency Assistance** - SOS system with trusted contact notifications
- **Location Services** - Maps, emergency service locator, live sharing
- **Multilingual Support** - Multiple language support with AI translation
- **Admin Dashboard** - Comprehensive monitoring and management

---

## ✨ Features

### Core Modules

1. **Authentication & Authorization**
   - User registration and login
   - JWT-based authentication
   - Role-based access control (Traveler, Trusted Contact, Admin)
   - Password management and email verification

2. **User Profiles**
   - Comprehensive profile management
   - Emergency contact information
   - Privacy settings
   - Account deletion

3. **Trip Management**
   - Create, update, delete trips
   - Trip dashboard with real-time status
   - Trip members and shared itineraries
   - Trip history

4. **SOS Emergency System**
   - Highly visible SOS button
   - One-tap emergency activation
   - Automatic location capture
   - Trusted contact notifications
   - Nearby emergency services display

5. **Live Location Sharing**
   - Explicit user consent required
   - Start/stop location sharing
   - Temporary sharing options
   - Location accuracy indicator
   - Battery-efficient updates

6. **AI Travel Planner**
   - Generate day-wise itineraries
   - Safety recommendations
   - Budget estimation
   - Weather considerations
   - Attraction suggestions

7. **AI Travel Assistant (Chatbot)**
   - Conversational AI support
   - Destination safety queries
   - Emergency guidance
   - Language translation
   - Multi-language support

8. **Destination Safety Score**
   - Comprehensive safety assessment
   - Crime and risk indicators
   - Weather risk analysis
   - Health and medical risk
   - Emergency service availability

9. **Risk Detection & Alerts**
   - Weather-based alerts
   - Location-based risk zones
   - Travel route disruptions
   - Real-time notifications
   - Risk severity levels

10. **Weather Integration**
    - Real-time weather data
    - Forecast information
    - Severe weather alerts
    - Weather-based trip recommendations

11. **Map & Location Services**
    - Interactive maps
    - Route planning
    - Nearby POI search
    - Safety zone visualization
    - Real-time location sharing on maps

12. **Nearby Emergency Services**
    - Police stations
    - Hospitals and clinics
    - Pharmacies
    - Ambulance services
    - Fire stations
    - Tourist assistance centers

13. **Emergency Directory**
    - Country/region-specific emergency numbers
    - Disaster management contacts
    - Local helplines
    - International emergency services

14. **Incident Reporting**
    - Report unsafe incidents
    - Multi-category support
    - Photo/video attachments
    - Severity classification
    - Moderation and validation

15. **AI Incident Classification**
    - Automatic incident categorization
    - Severity assessment
    - Duplicate detection
    - Misinformation filtering

16. **Multilingual Support**
    - English, Hindi, Marathi, Kannada
    - UI translations
    - AI assistant multilingual support
    - Voice interaction support

17. **Voice Assistant**
    - Speech-to-text input
    - Text-to-speech output
    - Language detection
    - Intent recognition

18. **Notifications**
    - In-app notifications
    - Email notifications
    - Push notifications
    - Notification preferences
    - Priority-based delivery

19. **Admin Dashboard**
    - User management
    - Incident monitoring
    - SOS event tracking
    - Analytics and reporting
    - Risk zone management

20. **Analytics**
    - User engagement metrics
    - Trip statistics
    - Safety alert analytics
    - Emergency service usage
    - Geographic distribution analysis

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│       Frontend (React + TypeScript)     │
│   - Dashboard, Maps, AI Chat, Admin UI  │
└────────────────┬────────────────────────┘
                 │ (REST APIs)
┌────────────────▼────────────────────────┐
│    Backend (Spring Boot + Java)         │
│  - Controllers, Services, Repositories  │
│  - Authentication, Business Logic       │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
 ┌──────┐   ┌──────────┐  ┌──────────┐
 │  DB  │   │ AI Svc   │  │ External │
 │ Pg   │   │(FastAPI) │  │  APIs    │
 └──────┘   └──────────┘  └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Google Maps React** for maps
- **Chart.js** for analytics
- **React Query** for data fetching

### Backend
- **Spring Boot 3.x** with Java 17+
- **Spring Security** for authentication
- **Spring Data JPA** for database
- **Spring Cloud** for microservices (optional)
- **Hibernate** for ORM
- **JWT** for token management
- **Lombok** for boilerplate reduction

### Database
- **PostgreSQL 15** as primary database
- **Redis** for caching and sessions
- **Liquibase** for migrations

### AI Service
- **Python 3.10+**
- **FastAPI** for API framework
- **OpenAI API** for LLM
- **Pydantic** for validation
- **SQLAlchemy** for database

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** for CI/CD
- **Swagger/OpenAPI** for API documentation

---

## 📂 Project Structure

```
tourguardian/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tourguardian/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── dto/
│   │   │   │   ├── security/
│   │   │   │   ├── exception/
│   │   │   │   ├── util/
│   │   │   │   └── TourguardianApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── db/migration/
│   │   └── test/
│   ├── pom.xml
│   ├── Dockerfile
│   └── mvnw
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── database/
│   ├── schema/
│   ├── migrations/
│   └── seed-data/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── tests/
│   ├── integration/
│   ├── unit/
│   └── e2e/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Java 17+
- Node.js 16+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Git

### Clone Repository

```bash
git clone https://github.com/SANJIVANEE2903/tourguardian.git
cd tourguardian
```

### Setup with Docker (Recommended)

```bash
# Copy environment file
cp .env.example .env

# Update .env with your configuration
nano .env

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
mvn clean install

# Run migrations
mvn liquibase:update

# Start backend
mvn spring-boot:run
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

#### AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key configurations:

- **Database**: PostgreSQL connection details
- **JWT**: Secret key for token signing
- **External APIs**: Weather, Maps, AI keys
- **Email**: SMTP configuration for notifications
- **Redis**: Caching and session storage

### Database Configuration

Update `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tourguardian_db
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
```

---

## 🗄️ Database Setup

### Create Database

```bash
psql -U postgres -c "CREATE DATABASE tourguardian_db;"
```

### Run Migrations

```bash
cd backend
mvn liquibase:update
```

### Seed Data (Optional)

```bash
psql -U postgres -d tourguardian_db -f database/seed-data/seed.sql
```

---

## 🏃 Running the Application

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- AI Service: http://localhost:8000
- Swagger UI: http://localhost:8080/swagger-ui.html

### Running Individually

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: AI Service
cd ai-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📖 API Documentation

### Swagger UI

Access at: `http://localhost:8080/swagger-ui.html`

### Key API Endpoints

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
```

#### Users
```
GET    /api/v1/users/me
PUT    /api/v1/users/me
GET    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

#### Trips
```
POST   /api/v1/trips
GET    /api/v1/trips
GET    /api/v1/trips/{id}
PUT    /api/v1/trips/{id}
DELETE /api/v1/trips/{id}
```

#### SOS
```
POST   /api/v1/sos
GET    /api/v1/sos/history
POST   /api/v1/sos/{id}/cancel
```

#### Location
```
POST   /api/v1/location/share
POST   /api/v1/location/stop
GET    /api/v1/location/shared/{userId}
```

#### AI
```
POST   /api/v1/ai/chat
POST   /api/v1/ai/plan-trip
POST   /api/v1/ai/analyze-risk
```

See [docs/API.md](docs/API.md) for complete API documentation.

---

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd ../frontend
npm test

# AI service tests
cd ../ai-service
pytest
```

### Run Specific Test Suite

```bash
# Unit tests only
mvn test -Dgroups=unit

# Integration tests only
mvn test -Dgroups=integration
```

### Code Coverage

```bash
mvn test jacoco:report
# Report at: target/site/jacoco/index.html
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d
```

### Kubernetes Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Kubernetes manifests.

### Cloud Deployment

- **AWS**: Use ECS, RDS, CloudFront
- **GCP**: Use Cloud Run, Cloud SQL, Cloud CDN
- **Azure**: Use App Service, SQL Database, CDN

---

## 📚 Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Design](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review documentation in `/docs`

---

## 🎯 Roadmap

- [ ] Phase 1: Core authentication & user profiles
- [ ] Phase 2: Trip management & maps
- [ ] Phase 3: AI assistant & travel planner
- [ ] Phase 4: Emergency services & SOS
- [ ] Phase 5: Admin dashboard
- [ ] Phase 6: Mobile app (React Native)
- [ ] Phase 7: Advanced analytics
- [ ] Phase 8: Community features

---

**Build with ❤️ for Safe Travels**
