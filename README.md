# AbachaOnline Delivery Platform

AI-powered campus delivery platform designed for low-connectivity environments.

## Project Overview

AbachaOnline is an e-commerce delivery platform optimized for university campuses in Sierra Leone. It features:

- **Offline-First Architecture**: Works seamlessly in low-connectivity environments
- **AI-Powered Optimization**: Demand forecasting using Facebook Prophet
- **Route Optimization**: Efficient delivery routes using OR-Tools
- **Multi-Payment Support**: Orange Money, token credits, and cash on delivery
- **Escrow System**: Secure payment handling
- **Progressive Web App**: Lightweight, mobile-optimized interface

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache**: Redis (optional)
- **Authentication**: JWT

### AI/ML
- **Forecasting**: Facebook Prophet (Python)
- **Route Optimization**: OR-Tools (Python)
- **Chatbot**: Rasa NLU (optional)

### Frontend (Phase 2)
- **Framework**: Preact
- **PWA**: Service Workers, IndexedDB
- **State**: SWR for data fetching

## Project Structure

```
abachaonline/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── ai/                  # Python AI services
│   ├── tests/               # Test files
│   ├── migrations/          # Database migrations
│   └── package.json
├── frontend/                # Preact PWA (Phase 2)
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Python** 3.9+ (for AI features)
- **Git**

### Phase 0: Initial Setup (Weeks 1-2)

#### Step 1: Clone and Install Dependencies

```bash
cd abachaonline/backend
npm install
```

#### Step 2: Setup PostgreSQL Database

1. Install PostgreSQL on your system
2. Create the database:

```bash
# On Windows (using psql)
psql -U postgres
CREATE DATABASE abachaonline_dev;
\q

# On macOS/Linux
createdb abachaonline_dev
```

3. Run the database schema:

```bash
psql -U postgres -d abachaonline_dev -f migrations/001_initial_schema.sql
```

#### Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/abachaonline_dev
```

#### Step 4: Setup Python Environment (Optional for Phase 0)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 5: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

#### Step 6: Verify Installation

Open your browser and visit:

- **Health Check**: http://localhost:3000/health
- **Database Check**: http://localhost:3000/health/db
- **API Info**: http://localhost:3000/api/v1

✅ **Phase 0 Complete** if `/health/db` returns `status: "ok"`

## Development Phases

### ✅ Phase 0: Setup & Database Foundation (Weeks 1-2)
- [x] Project structure created
- [x] Database schema defined
- [x] Express server configured
- [x] Environment setup
- [ ] **Next**: Test database connection

### 🔄 Phase 1: Core Backend APIs (Weeks 3-4)
- [ ] User authentication (register, OTP, JWT)
- [ ] Product listing and search
- [ ] Order creation and management
- [ ] Payment service with fallbacks
- [ ] Escrow system

### 📅 Phase 2: Minimum Frontend (Weeks 5-6)
- [ ] Preact PWA setup
- [ ] Product listing UI
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Offline sync

### 📅 Phase 3: AI Integration (Weeks 7-8)
- [ ] Prophet demand forecasting
- [ ] OR-Tools route optimization
- [ ] Beta testing with 5 users
- [ ] Performance benchmarks

### 📅 Phase 4: Refinement & Evaluation (Weeks 9-12)
- [ ] Full pilot (40-60 students) OR expert evaluation
- [ ] Bug fixes and optimization
- [ ] Final documentation

## API Endpoints (Phase 1)

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/refresh` - Refresh access token

### Products
- `GET /api/v1/products` - List products (with zone filtering)
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (merchant only)

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `PATCH /api/v1/orders/:id/status` - Update order status

### Payments
- `POST /api/v1/payments/initiate` - Initiate payment
- `POST /api/v1/payments/callback` - Payment gateway callback

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## Database Schema

See [migrations/001_initial_schema.sql](backend/migrations/001_initial_schema.sql) for the complete schema.

Key tables:
- `users` - Students, merchants, riders, admins
- `products` - Product catalog
- `orders` - Order management
- `order_items` - Order line items
- `escrow` - Payment escrow
- `deliveries` - Batch delivery routes
- `forecast_data` - AI predictions
- `token_credits` - Offline payment system

## Deployment

### Railway (Recommended for Quick Deployment)

1. Create a Railway account at https://railway.app
2. Create a new project
3. Add PostgreSQL database
4. Deploy backend:

```bash
railway login
railway init
railway up
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `NODE_ENV=production`
- `DATABASE_URL` (provided by Railway)
- `JWT_SECRET` (generate a strong random string)
- `FRONTEND_URL` (your frontend domain)

## Troubleshooting

### Database Connection Issues

If `/health/db` fails:

1. Verify PostgreSQL is running:
```bash
# Windows
pg_ctl status
# macOS/Linux
pg_isready
```

2. Check credentials in `.env`
3. Ensure database exists: `psql -l | grep abachaonline_dev`

### Port Already in Use

If port 3000 is occupied, change it in `.env`:
```env
PORT=3001
```

## Contributing

This is a thesis project for MSc in Computer Science.

## License

MIT

## Contact

For questions or issues, please create an issue in the repository.

---

**Current Status**: Phase 0 - Initial Setup ✅
**Next Milestone**: Phase 1 - Core Backend APIs
