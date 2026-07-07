# 📊 Automatic Profit Tracking System

A production-ready, full-stack profit tracking and inventory management system designed for small retail stores, wholesale businesses, and distributors. The system automates stock updates, tracks supplier purchase logs, validates sales checkout limits, computes daily margins, and generates 7-day ML profit predictions.

---

## 🚀 Technology Stack

### Frontend
* **Core**: React.js (Vite)
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM (v7)
* **Analytics**: Recharts (Area, Line, and Bar plots)
* **HTTP Client**: Axios

### Backend
* **Web Framework**: Python FastAPI
* **Database Driver & ORM**: PostgreSQL + SQLAlchemy ORM
* **Data Validation**: Pydantic v2
* **Authentication**: JWT tokens + Bcrypt hashing
* **Reporting**: OpenPyXL (Excel Spreadsheet generator)
* **Prediction**: Pure Python Linear Regression model

---

## 📁 Project Directory Layout

```text
Automatic-Profit-Tracking-System/
├── backend/
│   ├── app/
│   │   ├── database.py       # SQLAlchemy Connection local pool
│   │   ├── models.py         # DB Declarative Tables definitions
│   │   ├── schemas.py        # Pydantic validation structures
│   │   ├── auth.py           # JWT security & role checks
│   │   ├── routes/           # REST Router endpoints (Auth, Products, Sales, etc.)
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── purchases.py
│   │   │   ├── sales.py
│   │   │   ├── dashboard.py
│   │   │   └── reports.py
│   │   └── services/         # Forecasting and Event Logger services
│   │       ├── prediction_service.py
│   │       └── audit_service.py
│   │   └── main.py           # FastAPI central app initialization
│   ├── seed_data.py          # Seeding script for historical datasets
│   └── requirements.txt      # Python packages list
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbars and Sidebars components
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/          # Theme light/dark state
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/            # View components (Dashboard, Sales, Settings, etc.)
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Purchases.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.js            # Global routing configuration
│   │   ├── api.js            # Axios client instance
│   │   └── index.js          # Entrypoint file
│   ├── index.html            # Vite HTML template
│   ├── vite.config.js        # Vite configurations
│   ├── tailwind.config.js    # Tailwind Dark Mode preset config
│   └── package.json          # Node scripts and modules list
```

---

## 🗄️ Relational Database Schema

* **users**: `id`, `username`, `email`, `password_hash`, `role` (Admin/Staff), `created_at`
* **products**: `id`, `product_name`, `category`, `cost_price`, `selling_price`, `quantity`, `created_at`
* **purchases**: `id`, `product_id` (FK), `supplier`, `quantity`, `purchase_price`, `total_amount`, `purchased_at`
* **sales**: `id`, `product_id` (FK), `quantity`, `selling_price`, `total_sale`, `profit`, `sold_at`
* **profit_summary**: `id`, `date` (unique), `revenue`, `expense`, `profit`
* **audit_logs**: `id`, `user_id` (FK), `action`, `timestamp`

---

## 🛠️ Installation & Setup Guide

### 1. Database Configuration
By default, the application connects to a local PostgreSQL instance. Configure the database connection string in your environment or in `backend/app/database.py`:
```env
DATABASE_URL=postgresql://postgres:Teju%40123@localhost/profit_db
SECRET_KEY=your-security-key
```

### 2. Backend Server Setup
From the root workspace directory, run:
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Create and seed historical data (30 days of purchases & sales)
python seed_data.py

# Start the uvicorn API server
uvicorn app.main:app --port 8000
```
The swagger interactive API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Vite Setup
Open a new terminal session, navigate to the `frontend/` directory, and run:
```bash
# Install node packages
npm install

# Start Vite hot-reload development server
npm start
```
Vite will host the dashboard at `http://localhost:3000/Automatic-Profit-Tracking-System/`.

---

## 📡 REST API Router Catalog

* **Auth**:
  * `POST /api/auth/register` - Create user accounts with custom roles.
  * `POST /api/auth/login` - Authenticate users and return access tokens.
* **Products**:
  * `GET /api/products` - List products with category filters, keyword search, and pagination.
  * `POST /api/products` - Insert a new item (Admin restricted).
  * `PUT /api/products/{id}` - Modify details (Admin restricted).
  * `DELETE /api/products/{id}` - Delete product (Admin restricted).
  * `POST /api/products/import-csv` - Import bulk products list from a CSV sheet.
* **Purchases & Restocks**:
  * `GET /api/purchases` - View historical supplier invoices.
  * `POST /api/purchases` - Log a new purchase (auto increments stock and updates cost CPU).
* **Sales**:
  * `GET /api/sales` - View sales history.
  * `POST /api/sales` - Log sales invoice (auto decrements stock and validates stock limits).
* **Dashboard & Metrics**:
  * `GET /api/dashboard/summary` - Fetch Total Valuation, Expense, Revenue, and Profit totals.
  * `GET /api/dashboard/profit-trend` - Retrieve chronological daily revenue logs, top selling items, and ML forecasts.
  * `GET /api/dashboard/audit-logs` - Query security logs trails (Admin restricted).
* **Excel Reports**:
  * `GET /api/reports/inventory` - Export inventory sheets.
  * `GET /api/reports/purchases` - Export purchase logs.
  * `GET /api/reports/sales` - Export sales history logs.
  * `GET /api/reports/profit` - Export daily profit sheets.
