# Ice Cream Dashboard - Testing Guide

## 🎯 Overview
This guide will help you test all connections between customer and admin interfaces in the Ice Cream Dashboard application.

## 🚀 Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running (usually `http://localhost:3000`)
- MySQL database named `jice` (auto-created on first run)

---

## 📋 Test Scenarios

### 1. **Admin Login & Dashboard**
1. Go to `http://localhost:3000/Login`
2. Select **Admin** tab
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click **Admin Sign In**
5. ✅ Verify: Admin Dashboard loads successfully

---

### 2. **Customer Registration & Login**
1. Go to `http://localhost:3000/Login`
2. Select **Customer** tab
3. Click **Register**
4. Fill in:
   - Full Name: `Test Customer`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `9876543210` (optional)
5. Click **Create Account**
6. ✅ Verify: Customer account created and logged in

---

### 3. **Add Products (Admin)**
1. Login as Admin
2. Navigate to **Products** page
3. Click **Add Product**
4. Fill product details:
   - Name: `Chocolate Delight`
   - Category: `Chocolate`
   - Price: `150`
   - Stock: `50`
   - Image: Upload an image (optional)
5. Click **Create Product**
6. ✅ Verify: Product appears in products list

---

### 4. **Customer Browse Products & Add to Cart**
1. Login as Customer
2. View the dashboard with all ice creams
3. Click **Add to Cart** on any product
4. ✅ Verify: Cart counter in header updates
5. Click cart icon (or navigate to `/customer/cart`)
6. ✅ Verify: Cart page shows selected products
7. Adjust quantities using +/- buttons
8. ✅ Verify: Total price updates correctly

---

### 5. **Place Order (Customer)**
1. In Cart page with items
2. Review order summary
3. Click **Proceed to Checkout**
4. ✅ Verify: Success message appears
5. ✅ Verify: Redirected to Orders page
6. ✅ Verify: Order appears in customer orders list with "Pending" status

---

### 6. **View Orders (Customer)**
1. Login as Customer
2. Navigate to **My Orders** page
3. ✅ Verify: All placed orders appear
4. Click on an order
5. ✅ Verify: Order details show product name, quantity, price, and status
6. ✅ Verify: Order statistics (Total Orders, Completed, Total Spent) are correct

---

### 7. **Manage Orders (Admin)**
1. Login as Admin
2. Navigate to **Orders** page
3. ✅ Verify: All customer orders appear
4. Search for specific orders by customer name, product, or ID
5. Filter by status (Pending, Processing, Completed)
6. Filter by customer name
7. ✅ Verify: Filters work correctly

---

### 8. **Update Order Status (Admin)**
1. In Orders page, click **Edit** on any order
2. Change status from "Pending" to "Processing"
3. Click **Update Order**
4. ✅ Verify: Order status updates in admin view
5. Login as same customer
6. Navigate to **My Orders**
7. ✅ Verify: Order status reflects the change (Pending → Processing)

---

### 9. **Customer View Order Details**
1. As customer, click **View Details** on any order
2. ✅ Verify: Modal shows:
   - Order ID and date
   - Current status with icon
   - Customer information
   - Product details (name, quantity, price)
   - Total amount
   - Edit and Close buttons

---

### 10. **Admin View Order Details**
1. As admin, click **View Details** on any order
2. ✅ Verify: Modal shows complete order information
3. Click **Edit Order**
4. ✅ Verify: Opens edit form with pre-filled data

---

### 11. **Stock Management**
1. Login as Admin
2. Navigate to **Products**
3. Note current stock of a product
4. Login as Customer
5. Add that product to cart multiple times
6. Place order
7. Login as Admin again
8. ✅ Verify: Stock decreases appropriately
9. Update stock manually if needed

---

### 12. **Customer Profile Management**
1. Login as Customer
2. Navigate to **Profile** page
3. ✅ Verify: Profile shows customer details
4. Update information
5. ✅ Verify: Changes save successfully

---

### 13. **Customer Management (Admin)**
1. Login as Admin
2. Navigate to **Customers** page
3. ✅ Verify: All registered customers appear
4. View customer details
5. Edit customer information
6. ✅ Verify: Changes reflect in customer profile

---

### 14. **Delete Order (Admin)**
1. Login as Admin
2. Navigate to **Orders**
3. Click **Delete** on an order
4. Confirm deletion
5. ✅ Verify: Order removed from admin view
6. Login as affected customer
7. Navigate to **My Orders**
8. ✅ Verify: Deleted order no longer appears

---

### 15. **Delete Product (Admin)**
1. Login as Admin
2. Navigate to **Products**
3. Click **Delete** on a product
4. Confirm deletion
5. ✅ Verify: Product removed from list
6. Login as Customer
7. ✅ Verify: Deleted product no longer appears

---

## 🔄 Data Flow Verification

### Order Placement Flow:
```
Customer → Add to Cart → Checkout → Backend API → Database
Customer Orders ← Backend API ← Database ← Admin Orders
```

### Status Update Flow:
```
Admin → Update Status → Backend API → Database → Customer Orders
```

### Product Management Flow:
```
Admin → Add/Edit/Delete Product → Backend API → Database → Customer View
```

---

## ✅ Success Criteria

All the following should work correctly:
- [x] Admin can login and access dashboard
- [x] Customer can register and login
- [x] Products created by admin appear for customers
- [x] Customers can add items to cart
- [x] Orders are placed and saved to database
- [x] Admin can view all customer orders
- [x] Admin can update order status
- [x] Customer can see order status updates
- [x] Product images display correctly
- [x] Cart calculations are accurate
- [x] Search and filters work in admin views
- [x] Both admin and customer can view order details
- [x] Stock management works correctly
- [x] Data persists across page refreshes

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Ensure both backend (port 5000) and frontend are running

### Issue: "Order not appearing in customer view"
**Solution:** Check browser console for errors, verify backend is accessible

### Issue: "Images not loading"
**Solution:** Verify image uploads are saved in `backend/static/uploads/`

### Issue: "Status not updating"
**Solution:** Refresh the page, check if backend received the update request

### Issue: "Database connection error"
**Solution:** Verify MySQL is running and credentials in `backend/app.py` are correct

---

## 📊 Testing Checklist

Use this checklist to verify all features:

### Admin Features:
- [ ] Login with admin credentials
- [ ] View dashboard statistics
- [ ] Add new products
- [ ] Edit existing products
- [ ] Delete products
- [ ] View all orders
- [ ] Search orders
- [ ] Filter orders by status
- [ ] Filter orders by customer
- [ ] Update order status
- [ ] Delete orders
- [ ] View customer list
- [ ] Edit customer information

### Customer Features:
- [ ] Register new account
- [ ] Login with customer credentials
- [ ] Browse all products
- [ ] View product details
- [ ] Search products
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Clear cart
- [ ] Place orders
- [ ] View order history
- [ ] View order details
- [ ] Track order status
- [ ] View profile
- [ ] Logout

---

## 🎉 Conclusion

Once all tests pass successfully, your Ice Cream Dashboard application is fully functional with proper connections between customer and admin interfaces!

For any issues or questions, refer to the console logs in both browser and backend terminal for detailed error messages.