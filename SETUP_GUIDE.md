# Ice Cream Dashboard - Setup Guide

## Project Status: ✅ FULLY OPERATIONAL

Both frontend and backend are running and connected successfully.

## Current Setup

### Frontend
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Framework**: React.js

### Backend
- **URL**: http://localhost:5000
- **Status**: ✅ Running
- **Framework**: Flask (Python)
- **Database**: MySQL (jice)

## Default Credentials

### Admin Login
- **Username**: admin
- **Password**: admin123

### Customer Access
- Customers can register with email and phone number
- No password required for customer login (email-based authentication)

## API Endpoints

### Authentication
- `POST /api/login` - Admin login
- `POST /api/customers/login` - Customer login
- `POST /api/customers` - Customer registration

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add product (requires token)
- `PUT /api/products/:id` - Update product (requires token)
- `DELETE /api/products/:id` - Delete product (requires token)

### Orders
- `GET /api/orders` - Get all orders (requires token)
- `GET /api/orders/customer/:email` - Get customer orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order (requires token)
- `DELETE /api/orders/:id` - Delete order (requires token)

### Customers
- `GET /api/customers` - Get all customers (requires token)
- `POST /api/customers` - Add customer
- `PUT /api/customers/:id` - Update customer (requires token)
- `DELETE /api/customers/:id` - Delete customer (requires token)

### Analytics
- `GET /api/analytics/stats` - Get statistics (requires token)
- `GET /api/analytics/recent-activity` - Get recent activity (requires token)
- `GET /api/analytics/top-products` - Get top products (requires token)
- `GET /api/analytics/sales-by-category` - Get sales by category (requires token)
- `GET /api/analytics/daily-sales` - Get daily sales (requires token)

## How to Start the Application

### Start Backend
```bash
python backend\app.py
```
The backend will start on http://localhost:5000

### Start Frontend
```bash
npm start
```
The frontend will start on http://localhost:3001

## Database Setup

The database is automatically initialized on first run. Tables created:
- `products` - Stores ice cream products
- `orders` - Stores customer orders
- `customers` - Stores customer information
- `admins` - Stores admin accounts

## File Structure

```
icecream-dashboard/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── .env                # Environment variables (with database credentials)
│   ├── .env.example        # Environment variables template
│   ├── static/uploads/     # Product images
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── src/
│   ├── components/         # React components
│   ├── context/           # React context (Auth)
│   ├── pages/             # React pages
│   ├── App.js             # Main React app
│   └── index.js           # Entry point
├── public/                # Static files
├── package.json           # Node.js dependencies
└── .env                   # Frontend environment variables
```

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Aryapatil1626
DB_NAME=jice
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
FLASK_ENV=development
FLASK_DEBUG=1
```

### Frontend (.env)
```env
PORT=3001
REACT_APP_API_URL=http://localhost:5000
```

## Features

### Admin Dashboard
- Login with admin credentials
- Manage products (add, edit, delete)
- Manage orders (view, update status)
- Manage customers (view, edit, delete)
- View analytics and statistics
- Track sales and revenue

### Customer Portal
- Register with email and phone
- Login with email
- Browse products
- Add items to cart
- Place orders
- View order history
- View profile

## Security Notes

⚠️ **IMPORTANT**: This is a development setup. For production:
1. Change all default passwords
2. Use strong JWT secret keys
3. Enable HTTPS
4. Use environment variables for sensitive data
5. Implement rate limiting
6. Add input validation and sanitization
7. Use a production WSGI server (e.g., Gunicorn)

## Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database credentials in `backend/.env`
- Check if port 5000 is available

### Frontend won't start
- Check if Node.js is installed
- Run `npm install` if dependencies are missing
- Check if port 3001 is available

### Database connection issues
- Verify MySQL service is running
