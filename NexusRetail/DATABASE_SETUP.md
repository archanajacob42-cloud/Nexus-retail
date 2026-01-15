# NexusRetail Database Setup Guide

## Quick Start (5 minutes)

### **Step 1: Choose Your Database Option**

#### Option A: MongoDB Atlas (Cloud) - RECOMMENDED ⭐
- No installation required
- Free tier available (512 MB)
- Accessible from anywhere
- Perfect for development and production

#### Option B: MongoDB Local
- Full control over your database
- No internet required
- Better for local development
- Requires installation

---

## **Detailed Setup Instructions**

### **OPTION A: MongoDB Atlas Setup (Recommended)**

#### **1.1 Create Free Account**
```
Visit: https://www.mongodb.com/cloud/atlas
Click: "Try Free"
Sign up with: Google, GitHub, or Email
Verify email address
```

#### **1.2 Create Organization & Project**
- Organization name: `NexusRetail`
- Project name: `NexusRetail Dev`
- Click "Create Project"

#### **1.3 Build Your First Cluster**
1. Click **"Build a Database"**
2. Select **"M0 Free"** tier
3. Cloud Provider: **AWS** (or your preference)
4. Region: Select closest to you
5. Cluster Name: `nexusretail-cluster`
6. Click **"Create Cluster"** (Wait 3-5 minutes)

#### **1.4 Create Database User**
1. Left sidebar → **Security** → **Database Access**
2. Click **"+ Add New Database User"**
3. Authentication Method: **Password**
4. Username: `nexusretail`
5. Password: `NexusRetail123!` (use strong password)
6. Database User Privileges: **Atlas Admin**
7. Click **"Add User"**

#### **1.5 Configure Network Access**
1. Left sidebar → **Security** → **Network Access**
2. Click **"+ Add IP Address"**
3. Select **"Allow access from anywhere"** (for development)
   - Or enter your IP: `0.0.0.0/0`
4. Click **"Confirm"**

#### **1.6 Get Connection String**
1. Go to **Databases** section
2. Find your cluster
3. Click **"Connect"**
4. Select **"Drivers"**
5. Choose **"Node.js"**
6. Copy the connection string

**Format:**
```
mongodb+srv://nexusretail:NexusRetail123!@cluster0.xxxxx.mongodb.net/nexusretail?retryWrites=true&w=majority
```

#### **1.7 Update Environment**
Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://nexusretail:NexusRetail123!@cluster0.xxxxx.mongodb.net/nexusretail?retryWrites=true&w=majority
```

---

### **OPTION B: MongoDB Local Setup**

#### **2.1 Download MongoDB**
```
Visit: https://www.mongodb.com/try/download/community
Select:
  - Platform: Windows
  - Version: Latest
  - Package: .msi
Download to your computer
```

#### **2.2 Run Installer**
1. Double-click the `.msi` file
2. Click **"Next"** through setup wizard
3. **Important:** Check ✓ "Install MongoDB as a Service"
4. Service Name: `MongoDB`
5. Run Service as: Local System User
6. Click **"Install"**
7. Wait for installation (2-5 minutes)

#### **2.3 Start MongoDB Service**
Open PowerShell as **Administrator**:
```powershell
net start MongoDB
```

Or manage via Services:
```powershell
services.msc
# Find "MongoDB" and start it
```

#### **2.4 Verify Installation**
Open PowerShell and run:
```powershell
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
MongoServerError: command saslStart requires authentication
>
```

#### **2.5 Create Database & User**
In MongoDB shell:
```javascript
// Switch to admin database
use admin

// Create admin user
db.createUser({
  user: "nexusretail",
  pwd: "NexusRetail123!",
  roles: [{role: "root", db: "admin"}]
})

// Create database
use nexusretail

// Create collection (optional)
db.createCollection("users")

// Exit shell
exit
```

#### **2.6 Update Environment**
Edit `server/.env`:
```env
MONGODB_URI=mongodb://nexusretail:NexusRetail123!@localhost:27017/nexusretail?authSource=admin
```

---

## **Step 3: Seed Database with Sample Data**

### **3.1 Run Seeding Script**
```bash
cd NexusRetail/server
npm run seed
```

You should see:
```
✅ MongoDB connected
🗑️  Cleared existing data
✅ Created 3 users
✅ Created 7 sample products

📊 Database Seeding Complete!

Sample Login Credentials:
─────────────────────────────────
Admin User:
  Email: admin@nexusretail.com
  Password: admin123

Customer User:
  Email: customer@nexusretail.com
  Password: customer123
─────────────────────────────────
```

---

## **Step 4: Verify Database Connection**

### **4.1 Restart Server**
Stop and restart your server:
```bash
# Press Ctrl+C to stop current server
# Then restart
npm run dev
```

You should see:
```
✅ Server running on port 5000
📍 Environment: development
🗄️  Database: mongodb+srv://nexusretail:...
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

### **4.2 Test API Connection**
Open new terminal:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-14T....."
}
```

---

## **Step 5: View Database (Optional)**

### **Option A: MongoDB Compass (Visual Database Manager)**
1. Download: https://www.mongodb.com/try/download/compass
2. Install on your computer
3. Create connection:
   - **For Atlas:** Paste your connection string
   - **For Local:** `mongodb://nexusretail:NexusRetail123!@localhost:27017`
4. Click "Connect"
5. Browse your databases and collections

### **Option B: MongoDB Shell**
```bash
# Connect to your database
mongosh "mongodb+srv://nexusretail:NexusRetail123!@cluster0.xxxxx.mongodb.net/nexusretail"

# Or for local:
mongosh -u nexusretail -p NexusRetail123! --authenticationDatabase admin

# View databases
show databases

# Switch to nexusretail
use nexusretail

# View collections
show collections

# View users
db.users.find().pretty()

# View products
db.products.find().pretty()
```

---

## **Troubleshooting**

### **Problem: Connection Refused (Local MongoDB)**
```
Error: connect ECONNREFUSED ::1:27017
```

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# Or verify service is running
Get-Service MongoDB
```

### **Problem: Authentication Failed (Atlas)**
```
Error: authentication failed
```

**Check:**
1. Username and password correct in `.env`
2. Database user created in MongoDB Atlas
3. IP address whitelisted in Network Access
4. Connection string correct

### **Problem: Database Access Denied (Local)**
```
Error: command saslStart requires authentication
```

**Solution:**
Use correct connection string with credentials:
```
mongodb://nexusretail:NexusRetail123!@localhost:27017/nexusretail?authSource=admin
```

### **Problem: Seeding Script Fails**
```bash
# Clear .env issues
# Delete node_modules and reinstall
rm -r node_modules
npm install

# Try seeding again
npm run seed
```

---

## **Database Schema Overview**

### **Collections Created:**

#### **1. Users**
- Stores admin and customer accounts
- Password hashed with bcryptjs
- Fields: email, firstName, lastName, role, address, etc.

#### **2. Products**
- Stores e-commerce products
- Fields: name, price, stock, category, images, ratings, etc.

#### **3. Orders**
- Stores customer orders
- Fields: orderNumber, items, pricing, status, tracking, etc.

#### **4. Audit Logs**
- Tracks admin actions
- Fields: action, entityType, changes, timestamp, severity, etc.

---

## **Sample Data Included**

### **Users:**
- 1 Admin user
- 2 Customer users

### **Products (7 Total):**
1. Wireless Bluetooth Headphones ($149.99)
2. Premium Cotton T-Shirt ($19.99)
3. Stainless Steel Water Bottle ($39.99) ⚠️ LOW STOCK
4. Yoga Mat ($34.99)
5. The Art of Programming Book ($44.99) ⚠️ LOW STOCK
6. Organic Face Serum ($79.99)
7. Action Figure Set ($34.99)

---

## **Next Steps**

After database is set up:

1. ✅ Restart server with `npm run dev`
2. ✅ Test login with provided credentials
3. ✅ Create orders and track them
4. ✅ View products in catalog
5. ✅ Access admin dashboard

---

## **Production Database Setup**

When ready to deploy:

### **For MongoDB Atlas:**
1. Create dedicated production cluster
2. Create read-only users for application
3. Enable IP whitelist (not 0.0.0.0/0)
4. Enable encryption and backups
5. Use strong passwords
6. Enable audit logs

### **Connection String Example:**
```
mongodb+srv://nexusretail-prod:SecurePassword@cluster-prod.xxxxx.mongodb.net/nexusretail-prod?retryWrites=true&w=majority
```

---

## **Need Help?**

- **MongoDB Docs:** https://docs.mongodb.com
- **MongoDB University:** https://university.mongodb.com (Free courses)
- **Atlas Help:** https://www.mongodb.com/docs/atlas/

---

**Happy Building! 🚀**
