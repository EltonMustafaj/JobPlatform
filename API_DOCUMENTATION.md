# API Documentation

## Base URL
```
Production: https://your-project.supabase.co
Development: http://localhost:54321
```

## Authentication

All API requests require authentication using Supabase JWT tokens.

### Headers
```
Authorization: Bearer <your-jwt-token>
apikey: <your-anon-key>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

---

### Jobs

#### Get All Jobs
```http
GET /rest/v1/jobs?select=*
```

Query Parameters:
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset
- `order`: Sort order (e.g., `created_at.desc`)

#### Get Job by ID
```http
GET /rest/v1/jobs?id=eq.<job-id>&select=*
```

#### Create Job
```http
POST /rest/v1/jobs
Content-Type: application/json

{
  "title": "Software Engineer",
  "description": "We are looking for...",
  "company_id": "uuid",
  "location": "Remote",
  "salary_min": 50000,
  "salary_max": 80000,
  "employment_type": "full-time"
}
```

#### Update Job
```http
PATCH /rest/v1/jobs?id=eq.<job-id>
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "salary_max": 100000
}
```

#### Delete Job
```http
DELETE /rest/v1/jobs?id=eq.<job-id>
```

---

### Applications

#### Apply to Job
```http
POST /rest/v1/applications
Content-Type: application/json

{
  "job_id": "uuid",
  "user_id": "uuid",
  "cv_url": "https://...",
  "cover_letter": "I am interested in..."
}
```

#### Get User Applications
```http
GET /rest/v1/applications?user_id=eq.<user-id>&select=*,jobs(*)
```

#### Update Application Status
```http
PATCH /rest/v1/applications?id=eq.<application-id>
Content-Type: application/json

{
  "status": "reviewed"
}
```

---

### Profiles

#### Get User Profile
```http
GET /rest/v1/profiles?id=eq.<user-id>&select=*
```

#### Update Profile
```http
PATCH /rest/v1/profiles?id=eq.<user-id>
Content-Type: application/json

{
  "full_name": "John Doe",
  "bio": "Experienced developer...",
  "location": "New York, NY"
}
```

---

### Saved Jobs

#### Save Job
```http
POST /rest/v1/saved_jobs
Content-Type: application/json

{
  "user_id": "uuid",
  "job_id": "uuid"
}
```

#### Get Saved Jobs
```http
GET /rest/v1/saved_jobs?user_id=eq.<user-id>&select=*,jobs(*)
```

#### Remove Saved Job
```http
DELETE /rest/v1/saved_jobs?user_id=eq.<user-id>&job_id=eq.<job-id>
```

---

### Job Alerts

#### Create Job Alert
```http
POST /rest/v1/job_alerts
Content-Type: application/json

{
  "user_id": "uuid",
  "keywords": ["react", "typescript"],
  "location": "Remote",
  "min_salary": 60000
}
```

#### Get User Alerts
```http
GET /rest/v1/job_alerts?user_id=eq.<user-id>&select=*
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Field 'email' is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Job with ID 123 does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

- **Free Tier**: 100 requests per minute
- **Pro Tier**: 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks

Configure webhooks in Supabase Dashboard for real-time events:

### Available Events
- `job.created`
- `job.updated`
- `application.created`
- `application.status_changed`

### Webhook Payload
```json
{
  "event": "job.created",
  "timestamp": "2025-12-10T12:00:00Z",
  "data": {
    "id": "uuid",
    "title": "Software Engineer",
    ...
  }
}
```

---

## SDK Usage

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Get jobs
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .order('created_at', { ascending: false });
```

---

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
