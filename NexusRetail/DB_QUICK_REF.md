# 🗄️ NexusRetail Database - Quick Reference

## **TL;DR - 3 Minute Setup**

### **Step 1: Choose Option**
- **Easiest:** MongoDB Atlas (Cloud) - No installation
- **Local:** MongoDB Local - Requires installation

### **Step 2: Get Connection String**

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster.mongodb.net/nexusretail?retryWrites=true&w=majority
```

**MongoDB Local:**
```
mongodb://nexusretail:NexusRetail123!@localhost:27017/nexusretail?authSource=admin
```

### **Step 3: Update .env File**
```bash
# Edit: server/.env
MONGODB_URI=<your-connection-string-here>
```

### **Step 4: Seed Data**
```bash
cd server
npm run seed
```

### **Step 5: Restart Server**
```bash
npm run dev
```

---

## **Commands Reference**

### **Database Operations**
```bash
# Seed database with sample data
npm run seed

# Start server with database
npm run dev

# Start production server
npm start
```

### **MongoDB Shell Commands**

**Connect to Database:**
```bash
# Atlas
mongosh "mongodb+srv://nexusretail:password@cluster.mongodb.net/nexusretail"

# Local
mongosh -u nexusretail -p NexusRetail123! --authenticationDatabase admin
```

**Database Queries:**
```javascript
// Show all users
db.users.find().pretty()

// Show all products
db.products.find().pretty()

// Show low stock products
db.products.find({$expr: {$lt: [{$subtract: ["$stock.quantity", "$stock.reserved"]}, 5]}})

// Show all orders
db.orders.find().pretty()

// Count total products
db.products.countDocuments()

// Delete all data (careful!)
db.users.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})
```

---

## **Test Credentials**

```
ADMIN:
  Email: admin@nexusretail.com
  Password: admin123

CUSTOMER:
  Email: customer@nexusretail.com
  Password: customer123
```

---

## **Connection Troubleshooting**

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` (Local) | Start MongoDB: `net start MongoDB` |
| `authentication failed` (Atlas) | Check username/password in connection string |
| `IP not whitelisted` (Atlas) | Add IP in Network Access settings |
| `Database not found` | Seed database: `npm run seed` |

---

## **Environment Variables**

**Server (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## **Database Schema Summary**

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| Users | Authentication & Profiles | email, password, role, address |
| Products | Inventory | name, price, stock, category, images |
| Orders | Order Management | orderNumber, items, status, pricing |
| AuditLogs | Admin Tracking | action, entityType, changes, timestamp |

---

## **Sample Data**

**3 Users Created:**
- Admin (admin@nexusretail.com)
- Customer 1 (customer@nexusretail.com)
- Customer 2 (jane@example.com)

**7 Products Created:**
- Wireless Headphones (50 stock, 25% off)
- Cotton T-Shirt (200 stock, 33% off)
- Water Bottle (3 stock - LOW ⚠️, 2 reserved)
- Yoga Mat (75 stock, 24% off)
- Programming Book (2 stock - LOW ⚠️)
- Face Serum (30 stock)
- Action Figures (15 stock, 30% off)

---

## **Next Steps**

1. ✅ Set up database
2. ✅ Seed sample data
3. ✅ Restart server
4. ✅ Test login on http://localhost:3000
5. ✅ View products and admin dashboard

---

**Need More Details?** See `DATABASE_SETUP.md` for comprehensive guide.
