# TourGuardian - System Architecture

## Overview

TourGuardian follows a microservices-oriented architecture with clear separation of concerns:

```
┌─────────────────┐
│  React Frontend │
│   (TypeScript)  │
└────────┬────────┘
         │ REST APIs
┌────────▼────────────────────┐
│  Spring Boot Backend        │
│  (Java 17+, Business Logic) │
└────────┬───────────┬────────┘
         │           │
    ┌────▼──┐   ┌───▼─────┐
    │PostgreSQL   │Redis  │
    │(Primary DB) │(Cache)│
    └─────────┘   └───────┘

┌──────────────────┐
│  FastAPI Service │
│  (Python AI)     │
└──────────────────┘

┌──────────────────────┐
│  External APIs       │
│  - Weather           │
│  - Maps              │
│  - OpenAI            │
│  - Notifications     │
└──────────────────────┘
```

## Component Architecture

### Frontend Layer
- **Technology**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Features**:
  - Component-based architecture
  - Custom hooks for logic reuse
  - Type-safe development
  - Responsive design

### Backend Layer
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Architecture Pattern**: Layered architecture
- **Layers**:
  - **Controller Layer**: REST endpoints
  - **Service Layer**: Business logic
  - **Repository Layer**: Data access
  - **Entity Layer**: Domain models

### Database Layer
- **Primary**: PostgreSQL 15
- **Schema**: Normalized relational design
- **Caching**: Redis for sessions and cache
- **Migrations**: Liquibase for version control

### AI Service Layer
- **Framework**: FastAPI (Python)
- **Purpose**: NLP, text classification, recommendation
- **Integration**: REST API calls from backend

## Module Architecture

### 1. Authentication Module
```
Request → AuthController
          ↓
        AuthService → JwtProvider → UserRepository
          ↓
      Token Response
```

### 2. Trip Management Module
```
Request → TripController
          ↓
        TripService → TripRepository → PostgreSQL
          ↓
        TripDTO Response
```

### 3. Location & Map Module
```
Request → LocationController
          ↓
        LocationService → MapProvider (Google Maps)
          ↓
        Map Data Response
```

### 4. AI Assistant Module
```
Request → AIController
          ↓
        AIService → AIGateway → FastAPI Service
                                   ↓
                              OpenAI API
          ↓
        Response
```

### 5. SOS Emergency Module
```
Request → SOSController
          ↓
        SOSService → 
          ├─ LocationService (Get current location)
          ├─ NotificationService (Notify contacts)
          ├─ EmergencyServiceLocator (Find nearby help)
          └─ SOSRepository (Store event)
          ↓
        Emergency Response
```

### 6. Notification Module
```
Event → NotificationService
          ├─ InAppNotification
          ├─ EmailNotification
          ├─ PushNotification
          └─ SMSNotification (via Twilio)
          ↓
        User receives notification
```

### 7. Admin Dashboard Module
```
Request → AdminController
          ↓
        AdminService → Various Repositories
          ├─ UserRepository
          ├─ SOSRepository
          ├─ IncidentRepository
          └─ AnalyticsRepository
          ↓
        Dashboard Data
```

## Data Flow

### User Registration Flow
```
1. User submits registration form (Frontend)
2. Frontend validates input
3. POST /api/v1/auth/register (Backend)
4. AuthService validates email uniqueness
5. Password hashing (BCrypt)
6. User entity created in PostgreSQL
7. Verification email sent
8. JWT token returned
9. Frontend stores token in localStorage
10. User redirected to dashboard
```

### SOS Activation Flow
```
1. User taps SOS button (Frontend)
2. Confirmation dialog displayed
3. POST /api/v1/sos (Backend)
4. SOSService triggered
5. Get current location (LocationService)
6. Create SOS event in database
7. Fetch nearby emergency services (MapService)
8. Send notifications to trusted contacts
   - In-app notifications
   - Email notifications
   - SMS via Twilio
9. Store event in audit log
10. Return emergency information to frontend
11. Frontend displays:
    - Current location on map
    - Nearby emergency services
    - SOS status
    - Contact sharing
```

### AI Trip Planning Flow
```
1. User submits trip query (Frontend)
2. POST /api/v1/ai/plan-trip with parameters
3. Backend receives request
4. TripPlannerService processes request
5. Calls FastAPI AI Service
   - Sends trip parameters
   - Receives itinerary
6. Enriches response with:
   - Weather data from Weather API
   - Safety score for destination
   - Emergency services info
   - Travel tips
7. Response formatted and validated
8. Returns to frontend
9. Frontend displays itinerary with maps
```

## Security Architecture

### Authentication Flow
```
User Login
   ↓
Credentials validated
   ↓
JWT Token generated
   ↓
Token stored in localStorage (Frontend)
   ↓
Token sent in Authorization header
   ↓
JwtAuthenticationFilter validates
   ↓
SecurityContext populated
   ↓
Request processed
```

### Authorization Flow
```
Request received
   ↓
JWT token extracted
   ↓
Token signature verified
   ↓
User roles extracted
   ↓
@PreAuthorize checks roles
   ↓
Access granted/denied
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer (Nginx, HAProxy)
- Database read replicas
- Redis for distributed caching

### Vertical Scaling
- Resource optimization
- Database indexing
- Query optimization
- Connection pooling

### Caching Strategy
- **Redis Cache**: User sessions, frequently accessed data
- **HTTP Cache**: Static assets, weather data
- **Database Query Cache**: JPA second-level cache

## Deployment Architecture

### Development
```
Local machine
  ├─ React Dev Server (3000)
  ├─ Spring Boot (8080)
  ├─ PostgreSQL (5432)
  ├─ Redis (6379)
  └─ FastAPI (8000)
```

### Production
```
Cloud Infrastructure (AWS/GCP/Azure)
  ├─ Frontend (CDN + Static Hosting)
  ├─ Backend (Container Orchestration)
  ├─ Database (Managed Service)
  ├─ Cache (Managed Redis)
  ├─ API Gateway (Load Balancer)
  └─ External Services (Integrated)
```

## Error Handling Architecture

### Global Exception Handler
```
Exception thrown
   ↓
GlobalExceptionHandler intercepts
   ↓
Exception mapped to ResponseEntity
   ↓
Consistent error response format
   ↓
HTTP status code + error message + error code
   ↓
Logged for monitoring
   ↓
Returned to frontend
```

## Logging Architecture

- **Frontend**: Console logs for development
- **Backend**: Structured logging (SLF4J + Logback)
- **Centralization**: ELK Stack (optional)
- **Monitoring**: Application Insights / Datadog

## API Versioning

```
/api/v1/auth/login
/api/v1/trips
/api/v1/sos
```

Allows backward compatibility and smooth upgrades.

## Database Design Principles

1. **Normalization**: 3NF for consistency
2. **Indexes**: Strategic indexing for performance
3. **Constraints**: Foreign keys, unique constraints
4. **Audit Trail**: Created/updated timestamps
5. **Soft Deletes**: Logical deletion with deleted_at flag

## Technology Selection Rationale

- **Spring Boot**: Enterprise-grade, widely used, excellent ecosystem
- **React**: Modern, component-based, large community
- **PostgreSQL**: Reliable, ACID-compliant, excellent for relational data
- **Redis**: Fast caching, session management
- **FastAPI**: Modern Python framework, easy to use, high performance
- **TypeScript**: Type safety, better development experience

This architecture ensures TourGuardian is:
- **Scalable**: Can handle increased load
- **Maintainable**: Clear separation of concerns
- **Secure**: Multiple layers of security
- **Performant**: Optimized for speed
- **Extensible**: Easy to add new features
