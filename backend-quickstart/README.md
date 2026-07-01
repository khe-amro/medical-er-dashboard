# ER Dashboard Backend - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- Git
- 8GB RAM minimum

### Start Everything with One Command

```bash
# Clone and start
git clone <your-repo>
cd backend-quickstart
docker-compose up -d

# Check status
docker-compose ps
```

**That's it!** All services are now running:

- ✅ **Backend API**: http://localhost:5000
- ✅ **AI Service**: http://localhost:8000
- ✅ **PostgreSQL**: http://localhost:5432
- ✅ **Redis**: localhost:6379
- ✅ **MinIO (S3)**: http://localhost:9000
- ✅ **pgAdmin**: http://localhost:5050

### Test the API

```bash
# Health check
curl http://localhost:5000/api/health

# AI Service check
curl http://localhost:8000/health

# Get AI models
curl http://localhost:8000/models
```

---

## 📦 What's Included

### 1. PostgreSQL Database
- Pre-configured with ER schema
- Includes sample data
- Access via pgAdmin at http://localhost:5050
  - Email: admin@hospital.com
  - Password: admin123

### 2. Node.js Backend API
- Express.js server
- JWT authentication ready
- Socket.io for real-time features
- All routes pre-configured
- Auto-reload on code changes

### 3. Python AI Service
- FastAPI server
- 4 AI endpoints ready:
  - Triage prediction
  - Sepsis detection
  - X-ray analysis
  - Readmission risk
- Mock models for testing

### 4. Redis Cache
- Session storage
- Real-time data caching
- WebSocket state management

### 5. MinIO (S3-compatible)
- Medical image storage
- X-ray/CT scan uploads
- Access at http://localhost:9000
  - Username: minioadmin
  - Password: minioadmin123

---

## 🔧 Development Workflow

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-service
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Everything
```bash
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Access Database
```bash
# Using psql
docker-compose exec postgres psql -U er_admin -d er_dashboard

# Or use pgAdmin GUI at http://localhost:5050
```

---

## 🧪 Testing the System

### 1. Test Authentication

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123",
    "full_name": "Dr. John Smith",
    "role": "doctor",
    "department": "Emergency Medicine"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123"
  }'

# Save the token from response
```

### 2. Test Patient Creation

```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1980-05-15",
    "gender": "male",
    "mrn": "MRN001234"
  }'
```

### 3. Test AI Triage Prediction

```bash
curl -X POST http://localhost:8000/predict/triage \
  -H "Content-Type: application/json" \
  -d '{
    "age": 67,
    "gender": "male",
    "chief_complaint": "chest pain and shortness of breath",
    "vitals": {
      "heart_rate": 110,
      "blood_pressure": "140/90",
      "oxygen_saturation": 92,
      "respiratory_rate": 24
    },
    "history": ["hypertension", "diabetes"]
  }'
```

### 4. Test Sepsis Detection

```bash
curl -X POST http://localhost:8000/predict/sepsis \
  -H "Content-Type: application/json" \
  -d '{
    "vitals": {
      "systolic_bp": 95,
      "respiratory_rate": 26,
      "heart_rate": 115
    },
    "labs": {
      "lactate": 3.2,
      "wbc": 18000
    }
  }'
```

---

## 📁 Project Structure

```
backend-quickstart/
├── docker-compose.yml          # All services configuration
├── init-db.sql                 # Database initialization
├── backend/
│   ├── src/
│   │   ├── app.ts             # Main application
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Auth, validation, etc.
│   │   ├── services/          # Business logic
│   │   └── websocket/         # Socket.io handlers
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── ai-service/
│   ├── main.py                # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
└── README.md
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://er_admin:er_password_123@postgres:5432/er_dashboard
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-key
AI_SERVICE_URL=http://ai-service:8000
FRONTEND_URL=http://localhost:3000
```

### AI Service (.env)
```env
MODEL_PATH=/app/models
LOG_LEVEL=INFO
```

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Check if ports are in use
lsof -i :5000
lsof -i :5432
lsof -i :8000

# Reset everything
docker-compose down -v
docker-compose up -d
```

### Database connection failed
```bash
# Check PostgreSQL is ready
docker-compose exec postgres pg_isready

# Check logs
docker-compose logs postgres
```

### Can't connect to AI service
```bash
# Check if it's running
docker-compose ps ai-service

# Test directly
curl http://localhost:8000/health
```

---

## 📊 Database Schema

The database includes these main tables:
- `users` - Staff members (doctors, nurses, admins)
- `patients` - Patient demographics
- `er_visits` - Emergency room visits
- `vital_signs` - Vital sign measurements
- `lab_results` - Laboratory test results
- `medical_images` - X-rays, CT scans, etc.
- `ai_predictions` - AI model predictions
- `alerts` - System alerts
- `reports` - Generated reports

### Sample Queries

```sql
-- Get all active ER visits
SELECT * FROM er_visits WHERE status = 'waiting' OR status = 'in_treatment';

-- Get patient's latest vitals
SELECT * FROM vital_signs 
WHERE visit_id = 'some-uuid' 
ORDER BY recorded_at DESC 
LIMIT 1;

-- Count patients by ESI level
SELECT esi_level, COUNT(*) 
FROM er_visits 
WHERE status != 'discharged' 
GROUP BY esi_level;
```

---

## 🚢 Production Deployment

### Using Docker Compose (Production)

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
1. Change all default passwords
2. Use strong JWT secrets
3. Enable SSL/TLS
4. Configure proper CORS origins
5. Setup monitoring (Prometheus/Grafana)
6. Configure backups for PostgreSQL
7. Use production-grade S3 (AWS S3 instead of MinIO)

---

## 📚 API Documentation

Once running, visit:
- Backend API docs: http://localhost:5000/api-docs (Swagger)
- AI Service docs: http://localhost:8000/docs (FastAPI auto-docs)

---

## 🎯 Next Steps

1. **Connect Frontend**: Update your React app's API URL to `http://localhost:5000`
2. **Customize AI Models**: Replace mock AI logic with real trained models
3. **Add More Endpoints**: Extend the API based on your needs
4. **Setup Monitoring**: Add Prometheus metrics
5. **Write Tests**: Add unit and integration tests
6. **CI/CD**: Setup GitHub Actions or GitLab CI

---

## 💡 Tips

- Use `docker-compose logs -f` to watch live logs
- Database persists between restarts (volume: postgres_data)
- Backend auto-reloads on code changes (nodemon)
- AI service auto-reloads on code changes (uvicorn --reload)
- Access MinIO UI to manage uploaded files
- Use pgAdmin for database management

---

## 🆘 Support

If you encounter issues:
1. Check logs: `docker-compose logs [service-name]`
2. Verify all services are healthy: `docker-compose ps`
3. Reset everything: `docker-compose down -v && docker-compose up -d`

---

**You're all set! Your complete backend infrastructure is running! 🎉**
