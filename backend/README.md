  # Ice Cream Dashboard Backend

  Flask API with MySQL database for the ice cream dashboard.

  ## Quick Start

  1. **Start MySQL Service**
     - Windows: `net start MySQL80` (run as Administrator)
     - Linux/Mac: `sudo systemctl start mysql`

  2. **Configure MySQL Credentials** (if different from default)
     - Default password in code: `Aryapatil1626`
     - To change, set environment variable: `set DB_PASSWORD=your_password`
     - Or edit line 21 in `app.py`

  3. **Install dependencies**
     ```bash
     pip install -r requirements.txt
     ```

  4. **Run the Flask app** (creates database, tables, and admin user automatically)
     ```bash
     python app.py
     ```

  5. **Test the API**
     - API will be available at `http://localhost:5000`
     - Default admin credentials: `admin` / `admin123`

  The backend will automatically:
   - Create the `jice` database if it doesn't exist
   - Create all required tables (products, orders, customers, admins)
   - Create a default admin user

  ## Setup Details

  ### Environment Variables
  - `DB_HOST` (default: `localhost`)
  - `DB_USER` (default: `root`)
  - `DB_PASSWORD` (default: `Aryapatil1626`)
  - `DB_NAME` (default: `jice`)

  ### Database Schema
  - **products**: id, name, category, price, stock, image
  - **orders**: id, customer_name, product_id, quantity, total_price, status
  - **customers**: id, name, email, phone
  - **admins**: id, username, password

  ## Having Login Issues?

  See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting steps.

  Common issues:
  - MySQL not running
  - Wrong database password
  - Backend server not started
  - Admin user not created

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Add a new order