from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pymysql
from pymysql.cursors import DictCursor
import os
from werkzeug.utils import secure_filename
import jwt
import datetime
from functools import wraps
from werkzeug.exceptions import HTTPException
from bcrypt import hashpw, gensalt, checkpw
import logging
from logging.handlers import RotatingFileHandler
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load configuration from environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(32).hex())
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', '0') == '1'

# Configure logging
logging.basicConfig(level=logging.INFO)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
app.logger.addHandler(handler)

# File upload configuration
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/static/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Database connection pool
class DatabaseConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_connection(self):
        try:
            connection = pymysql.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME", "jice"),
                cursorclass=DictCursor,
                connect_timeout=10,
                read_timeout=30,
                write_timeout=30
            )
            return connection
        except pymysql.Error as e:
            app.logger.error(f"Database connection error: {str(e)}")
            raise

db_connection = DatabaseConnection()

def get_connection():
    return db_connection.get_connection()

# Input validation
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

# Password hashing
def hash_password(password):
    return hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

def verify_password(password, hashed):
    try:
        return checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        app.logger.error(f"Password verification error: {str(e)}")
        return False

# Token authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            app.logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

# Error handlers
@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad request', 'message': str(e)}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found', 'message': str(e)}), 404

@app.errorhandler(500)
def internal_error(e):
    app.logger.error(f"Internal server error: {str(e)}")
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

@app.errorhandler(HTTPException)
def handle_exception(e):
    return jsonify({'error': e.name, 'message': e.description}), e.code

# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password required'}), 400
        
        if not validate_password(password):
            return jsonify({'message': 'Invalid password format'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM admins WHERE username=%s", (username,))
                admin = cursor.fetchone()
            
            if admin:
                if verify_password(password, admin['password']):
                    token = jwt.encode({
                        'user_id': admin['id'],
                        'username': admin['username'],
                        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
                    }, app.config['SECRET_KEY'])
                    
                    app.logger.info(f"Admin login successful: {username}")
                    return jsonify({
                        'message': 'Login successful',
                        'token': token,
                        'user': {
                            'id': admin['id'],
                            'username': admin['username']
                        }
                    }), 200
                else:
                    app.logger.warning(f"Failed login attempt for admin: {username}")
                    return jsonify({'message': 'Invalid credentials'}), 401
            else:
                app.logger.warning(f"Failed login attempt for admin: {username}")
                return jsonify({'message': 'Invalid credentials'}), 401
        finally:
            conn.close()
            
    except pymysql.err.OperationalError as e:
        app.logger.error(f"Database connection failed: {str(e)}")
        return jsonify({'message': 'Database connection failed'}), 500
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'Login error. Please try again.'}), 500

# Products Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM products LIMIT %s OFFSET %s", (per_page, offset))
                products = cursor.fetchall()
                
                cursor.execute("SELECT COUNT(*) as total FROM products")
                total = cursor.fetchone()
            
            return jsonify({
                'products': products,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total['total'],
                    'pages': (total['total'] + per_page - 1) // per_page
                }
            })
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching products: {str(e)}")
        return jsonify({'message': 'Error fetching products'}), 500

@app.route('/api/products', methods=['POST'])
@token_required
def add_product():
    try:
        name = request.form.get('name')
        category = request.form.get('category')
        price = request.form.get('price')
        stock = request.form.get('stock')
        image = request.files.get('image')
        
        if not all([name, category, price, stock]):
            return jsonify({'message': 'All fields except image are required'}), 400
        
        try:
            price = float(price)
            stock = int(stock)
            if price <= 0 or stock < 0:
                return jsonify({'message': 'Price must be positive and stock must be non-negative'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid price or stock format'}), 400
        
        image_path = None
        if image:
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_path = f'/static/uploads/{filename}'
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO products (name, category, price, stock, image) VALUES (%s, %s, %s, %s, %s)",
                    (name, category, price, stock, image_path)
                )
                conn.commit()
                app.logger.info(f"Product added: {name}")
            return jsonify({'message': 'Product added successfully'}), 201
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error adding product: {str(e)}")
        return jsonify({'message': 'Error adding product'}), 500

@app.route('/api/products/<int:id>', methods=['PUT'])
@token_required
def update_product(id):
    try:
        name = request.form.get('name')
        category = request.form.get('category')
        price = request.form.get('price')
        stock = request.form.get('stock')
        image = request.files.get('image')
        
        if not all([name, category, price, stock]):
            return jsonify({'message': 'All fields except image are required'}), 400
        
        try:
            price = float(price)
            stock = int(stock)
            if price <= 0 or stock < 0:
                return jsonify({'message': 'Price must be positive and stock must be non-negative'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid price or stock format'}), 400
        
        image_path = None
        if image:
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_path = f'/static/uploads/{filename}'
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                if image_path:
                    cursor.execute(
                        "UPDATE products SET name=%s, category=%s, price=%s, stock=%s, image=%s WHERE id=%s",
                        (name, category, price, stock, image_path, id)
                    )
                else:
                    cursor.execute(
                        "UPDATE products SET name=%s, category=%s, price=%s, stock=%s WHERE id=%s",
                        (name, category, price, stock, id)
                    )
                conn.commit()
                app.logger.info(f"Product updated: {id}")
            return jsonify({'message': 'Product updated successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error updating product: {str(e)}")
        return jsonify({'message': 'Error updating product'}), 500

@app.route('/api/products/<int:id>', methods=['DELETE'])
@token_required
def delete_product(id):
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM products WHERE id=%s", (id,))
                conn.commit()
                app.logger.info(f"Product deleted: {id}")
            return jsonify({'message': 'Product deleted successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error deleting product: {str(e)}")
        return jsonify({'message': 'Error deleting product'}), 500

# Orders Routes
@app.route('/api/orders', methods=['GET'])
@token_required
def get_orders():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT o.*, p.name as product_name, p.image as product_image 
                    FROM orders o 
                    LEFT JOIN products p ON o.product_id = p.id
                    LIMIT %s OFFSET %s
                """, (per_page, offset))
                orders = cursor.fetchall()
                
                cursor.execute("SELECT COUNT(*) as total FROM orders")
                total = cursor.fetchone()
            
            return jsonify({
                'orders': orders,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total['total'],
                    'pages': (total['total'] + per_page - 1) // per_page
                }
            })
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'message': 'Error fetching orders'}), 500

@app.route('/api/orders/customer/<email>', methods=['GET'])
def get_customer_orders(email):
    try:
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT o.*, p.name as product_name, p.image as product_image 
                    FROM orders o 
                    LEFT JOIN products p ON o.product_id = p.id 
                    WHERE o.customer_email=%s
                """, (email,))
                orders = cursor.fetchall()
            return jsonify(orders)
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching customer orders: {str(e)}")
        return jsonify({'message': 'Error fetching customer orders'}), 500

@app.route('/api/orders', methods=['POST'])
def add_order():
    try:
        data = request.get_json()
        app.logger.info(f"Received order data: {data}")
        
        if not data or not all(k in data for k in ['customer_name', 'product_id', 'quantity', 'total_price']):
            app.logger.warning("Missing required fields in order")
            return jsonify({'error': 'Missing required fields'}), 400
        
        try:
            product_id = int(data['product_id'])
            quantity = int(data['quantity'])
            total_price = float(data['total_price'])
            
            if quantity <= 0 or total_price <= 0:
                return jsonify({'error': 'Quantity and total price must be positive'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid data format'}), 400
        
        status = data.get('status', 'pending')
        if status not in ['pending', 'completed', 'cancelled']:
            return jsonify({'error': 'Invalid status'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO orders (customer_name, customer_email, product_id, quantity, total_price, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (data['customer_name'], data.get('customer_email'), product_id, quantity, total_price, status)
                )
                conn.commit()
                app.logger.info(f"Order inserted successfully for customer: {data['customer_name']}")
            return jsonify({'message': 'Order added successfully', 'data': data}), 201
        finally:
            conn.close()
            
    except Exception as e:
        app.logger.error(f"Error adding order: {str(e)}")
        return jsonify({'error': 'Failed to add order'}), 500

@app.route('/api/orders/<int:id>', methods=['PUT'])
@token_required
def update_order(id):
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['customer_name', 'product_id', 'quantity', 'total_price']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        status = data.get('status', 'pending')
        if status not in ['pending', 'completed', 'cancelled']:
            return jsonify({'error': 'Invalid status'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE orders SET customer_name=%s, product_id=%s, quantity=%s, total_price=%s, status=%s WHERE id=%s",
                    (data['customer_name'], data['product_id'], data['quantity'], data['total_price'], status, id)
                )
                conn.commit()
                app.logger.info(f"Order updated: {id}")
            return jsonify({'message': 'Order updated successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error updating order: {str(e)}")
        return jsonify({'message': 'Error updating order'}), 500

@app.route('/api/orders/<int:id>', methods=['DELETE'])
@token_required
def delete_order(id):
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM orders WHERE id=%s", (id,))
                conn.commit()
                app.logger.info(f"Order deleted: {id}")
            return jsonify({'message': 'Order deleted successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error deleting order: {str(e)}")
        return jsonify({'message': 'Error deleting order'}), 500

# Customers Routes
@app.route('/api/customers', methods=['GET'])
@token_required
def get_customers():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM customers LIMIT %s OFFSET %s", (per_page, offset))
                customers = cursor.fetchall()
                
                cursor.execute("SELECT COUNT(*) as total FROM customers")
                total = cursor.fetchone()
            
            return jsonify({
                'customers': customers,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total['total'],
                    'pages': (total['total'] + per_page - 1) // per_page
                }
            })
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching customers: {str(e)}")
        return jsonify({'message': 'Error fetching customers'}), 500

@app.route('/api/customers/login', methods=['POST'])
def customer_login():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM customers WHERE email=%s", (email,))
                customer = cursor.fetchone()
            
            if customer:
                app.logger.info(f"Customer login successful: {email}")
                return jsonify({
                    'message': 'Login successful',
                    'customer': {
                        'id': customer['id'],
                        'name': customer['name'],
                        'email': customer['email'],
                        'phone': customer.get('phone', '')
                    }
                }), 200
            else:
                app.logger.warning(f"Customer not found: {email}")
                return jsonify({'message': 'Customer not found. Please register first.'}), 404
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Customer login error: {str(e)}")
        return jsonify({'message': 'Login error. Please try again.'}), 500

@app.route('/api/customers', methods=['POST'])
def add_customer():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'email', 'phone']):
            return jsonify({'message': 'All fields are required'}), 400
        
        if not validate_email(data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM customers WHERE email=%s", (data['email'],))
                if cursor.fetchone():
                    return jsonify({'message': 'Email already registered'}), 400
                
                cursor.execute(
                    "INSERT INTO customers (name, email, phone) VALUES (%s, %s, %s)",
                    (data['name'], data['email'], data['phone'])
                )
                conn.commit()
                app.logger.info(f"Customer added: {data['email']}")
            return jsonify({'message': 'Customer added successfully'}), 201
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error adding customer: {str(e)}")
        return jsonify({'message': 'Error adding customer'}), 500

@app.route('/api/customers/<int:id>', methods=['PUT'])
@token_required
def update_customer(id):
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'email', 'phone']):
            return jsonify({'message': 'All fields are required'}), 400
        
        if not validate_email(data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM customers WHERE email=%s AND id!=%s", (data['email'], id))
                if cursor.fetchone():
                    return jsonify({'message': 'Email already registered'}), 400
                
                cursor.execute(
                    "UPDATE customers SET name=%s, email=%s, phone=%s WHERE id=%s",
                    (data['name'], data['email'], data['phone'], id)
                )
                conn.commit()
                app.logger.info(f"Customer updated: {id}")
            return jsonify({'message': 'Customer updated successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error updating customer: {str(e)}")
        return jsonify({'message': 'Error updating customer'}), 500

@app.route('/api/customers/<int:id>', methods=['DELETE'])
@token_required
def delete_customer(id):
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM customers WHERE id=%s", (id,))
                conn.commit()
                app.logger.info(f"Customer deleted: {id}")
            return jsonify({'message': 'Customer deleted successfully'})
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error deleting customer: {str(e)}")
        return jsonify({'message': 'Error deleting customer'}), 500

# Analytics Routes
@app.route('/api/analytics/stats', methods=['GET'])
@token_required
def get_analytics_stats():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT SUM(total_price) as total FROM orders")
                revenue = cursor.fetchone()
                
                cursor.execute("SELECT COUNT(*) as count FROM orders")
                total_orders = cursor.fetchone()
                
                cursor.execute("SELECT COUNT(*) as count FROM products")
                total_products = cursor.fetchone()
                
                cursor.execute("SELECT COUNT(*) as count FROM customers")
                total_customers = cursor.fetchone()
                
                cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status='pending'")
                pending_orders = cursor.fetchone()
                
                cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status='completed'")
                completed_orders = cursor.fetchone()
            
            return jsonify({
                'total_revenue': float(revenue['total'] or 0),
                'total_orders': total_orders['count'],
                'total_products': total_products['count'],
                'total_customers': total_customers['count'],
                'pending_orders': pending_orders['count'],
                'completed_orders': completed_orders['count']
            })
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching analytics stats: {str(e)}")
        return jsonify({'message': 'Error fetching analytics stats'}), 500

@app.route('/api/analytics/recent-activity', methods=['GET'])
@token_required
def get_recent_activity():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT o.*, p.name as product_name 
                    FROM orders o 
                    LEFT JOIN products p ON o.product_id = p.id 
                    ORDER BY o.created_at DESC LIMIT 10
                """)
                recent_orders = cursor.fetchall()
                
                cursor.execute("SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5")
                low_stock = cursor.fetchall()
            
            activities = []
            for order in recent_orders:
                activities.append({
                    'id': order['id'],
                    'type': 'order',
                    'message': f"Order #{order['id']} - {order['customer_name']}",
                    'time': str(order['created_at']),
                    'status': 'success' if order['status'] == 'completed' else 'info'
                })
            
            for product in low_stock:
                activities.append({
                    'id': f"stock_{product['id']}",
                    'type': 'product',
                    'message': f"{product['name']} stock low ({product['stock']})",
                    'time': 'Just now',
                    'status': 'warning'
                })
            
            return jsonify(activities[:10])
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching recent activity: {str(e)}")
        return jsonify({'message': 'Error fetching recent activity'}), 500

@app.route('/api/analytics/top-products', methods=['GET'])
@token_required
def get_top_products():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.id, p.name, COUNT(o.id) as orders_count, SUM(o.total_price) as revenue
                    FROM products p
                    LEFT JOIN orders o ON p.id = o.product_id
                    GROUP BY p.id
                    ORDER BY revenue DESC
                    LIMIT 10
                """)
                top_products = cursor.fetchall()
            return jsonify(top_products)
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching top products: {str(e)}")
        return jsonify({'message': 'Error fetching top products'}), 500

@app.route('/api/analytics/sales-by-category', methods=['GET'])
@token_required
def get_sales_by_category():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.category, COUNT(o.id) as orders, SUM(o.total_price) as revenue
                    FROM products p
                    LEFT JOIN orders o ON p.id = o.product_id
                    GROUP BY p.category
                    ORDER BY revenue DESC
                """)
                sales_by_category = cursor.fetchall()
            return jsonify(sales_by_category)
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching sales by category: {str(e)}")
        return jsonify({'message': 'Error fetching sales by category'}), 500

@app.route('/api/analytics/daily-sales', methods=['GET'])
@token_required
def get_daily_sales():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_price) as revenue
                    FROM orders
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC
                """)
                daily_sales = cursor.fetchall()
            return jsonify(daily_sales)
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error fetching daily sales: {str(e)}")
        return jsonify({'message': 'Error fetching daily sales'}), 500

# Initialize database and tables
def initialize_database():
    try:
        conn = pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "")
        )
        try:
            with conn.cursor() as cursor:
                cursor.execute("CREATE DATABASE IF NOT EXISTS jice")
                conn.commit()
            app.logger.info("Database created or already exists")
        finally:
            conn.close()
        
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS products (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        price FLOAT NOT NULL,
                        stock INT NOT NULL,
                        image VARCHAR(255)
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_name VARCHAR(100) NOT NULL,
                        customer_email VARCHAR(100),
                        product_id INT NOT NULL,
                        quantity INT NOT NULL,
                        total_price FLOAT NOT NULL,
                        status VARCHAR(50) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS customers (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL,
                        phone VARCHAR(20)
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS admins (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL
                    )
                """)
                conn.commit()
                
                cursor.execute("SELECT * FROM admins WHERE username=%s", ('admin',))
                if not cursor.fetchone():
                    hashed_password = hash_password('admin123')
                    cursor.execute(
                        "INSERT INTO admins (username, password) VALUES (%s, %s)",
                        ('admin', hashed_password)
                    )
                    conn.commit()
                    app.logger.info("Default admin user created: username='admin', password='admin123'")
            app.logger.info("Database and tables created successfully!")
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error initializing database: {str(e)}")

if __name__ == '__main__':
    initialize_database()
    app.run(debug=app.config['DEBUG'], host='0.0.0.0')