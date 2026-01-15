# ✅ Database Setup Checklist

## **Pre-Setup Requirements**
- [ ] Node.js installed (v14+)
- [ ] npm installed (v6+)
- [ ] Git installed (optional)
- [ ] Internet connection
- [ ] Text editor open

---

## **MongoDB Atlas Setup (If Choosing Cloud)**

### **Account Creation**
- [ ] Visit mongodb.com/cloud/atlas
- [ ] Sign up with Google/GitHub/Email
- [ ] Verify email address
- [ ] Login to MongoDB Atlas

### **Cluster Setup**
- [ ] Create new project (name: NexusRetail)
- [ ] Click "Build a Database"
- [ ] Select "M0 Free" tier
- [ ] Choose AWS and nearest region
- [ ] Name cluster: nexusretail-cluster
- [ ] Create cluster (wait 3-5 minutes)

### **Security Configuration**
- [ ] Go to Security → Database Access
- [ ] Create database user
  - [ ] Username: `nexusretail`
  - [ ] Password: `NexusRetail123!`
  - [ ] Save user
- [ ] Go to Security → Network Access
- [ ] Add IP Address → Allow from anywhere
- [ ] Confirm IP access

### **Connection Setup**
- [ ] Go to Databases → Cluster → Connect
- [ ] Select "Drivers" option
- [ ] Choose Node.js version
- [ ] Copy connection string
- [ ] Store it safely (you'll need it next)

---

## **MongoDB Local Setup (If Choosing Local)**

### **Installation**
- [ ] Download MongoDB Community .msi from mongodb.com
- [ ] Run installer
- [ ] Accept license agreement
- [ ] Install as Windows Service
- [ ] Complete installation

### **Service Startup**
- [ ] Open PowerShell as Administrator
- [ ] Run: `net start MongoDB`
- [ ] Verify service started successfully

### **Database User Creation**
- [ ] Open PowerShell/Command Prompt
- [ ] Run: `mongosh`
- [ ] Create admin user:
  ```
  use admin
  db.createUser({user: "nexusretail", pwd: "NexusRetail123!", roles: [{role: "root", db: "admin"}]})
  ```
- [ ] Create database:
  ```
  use nexusretail
  db.createCollection("users")
  exit
  ```

---

## **Project Configuration**

### **Environment Setup**
- [ ] Open `server/.env` file
- [ ] Find line: `MONGODB_URI=...`
- [ ] Replace with your connection string:
  - **Atlas:** `mongodb+srv://nexusretail:NexusRetail123!@cluster0.xxxxx.mongodb.net/nexusretail?retryWrites=true&w=majority`
  - **Local:** `mongodb://nexusretail:NexusRetail123!@localhost:27017/nexusretail?authSource=admin`
- [ ] Save file
- [ ] Verify no typos in connection string

### **Verify .env Contents**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=<YOUR_CONNECTION_STRING_HERE>
JWT_SECRET=nexus_retail_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

---

## **Database Population**

### **Run Seeding Script**
- [ ] Open terminal in `NexusRetail/server` directory
- [ ] Run: `npm run seed`
- [ ] Wait for completion
- [ ] Verify output shows:
  - [ ] `✅ MongoDB connected`
  - [ ] `🗑️  Cleared existing data`
  - [ ] `✅ Created 3 users`
  - [ ] `✅ Created 7 sample products`

### **Sample Credentials Created**
- [ ] Admin user exists:
  - [ ] Email: `admin@nexusretail.com`
  - [ ] Password: `admin123`
- [ ] Customer user 1 exists:
  - [ ] Email: `customer@nexusretail.com`
  - [ ] Password: `customer123`
- [ ] Customer user 2 exists:
  - [ ] Email: `jane@example.com`
  - [ ] Password: `password123`

### **Sample Data Verification**
- [ ] 7 products created:
  - [ ] Wireless Headphones (50 stock)
  - [ ] Cotton T-Shirt (200 stock)
  - [ ] Water Bottle (3 stock - LOW)
  - [ ] Yoga Mat (75 stock)
  - [ ] Programming Book (2 stock - LOW)
  - [ ] Face Serum (30 stock)
  - [ ] Action Figures (15 stock)

---

## **Server Verification**

### **Start Development Server**
- [ ] Open terminal in `NexusRetail/server` directory
- [ ] Run: `npm run dev`
- [ ] Wait for startup messages
- [ ] Verify output shows:
  - [ ] `✅ Server running on port 5000`
  - [ ] `📍 Environment: development`
  - [ ] `✅ MongoDB connected` (or ⚠️ mock mode if no DB)

### **Test API Connection**
- [ ] Open new terminal
- [ ] Run: `curl http://localhost:5000/api/health`
- [ ] Verify response contains: `"success": true`

---

## **Client Verification**

### **Start React Application**
- [ ] Open new terminal in `NexusRetail/client` directory
- [ ] Run: `npm start`
- [ ] Wait for compilation
- [ ] Browser should auto-open to http://localhost:3000

### **UI Verification**
- [ ] Home page loads
- [ ] Navigation menu visible
- [ ] "Explore Products" button present
- [ ] Links work (Home, Products, Admin)

---

## **Application Testing**

### **Homepage**
- [ ] Page loads without errors
- [ ] NexusRetail logo visible
- [ ] Navigation menu visible
- [ ] "Explore Products" button works

### **Products Page**
- [ ] Products load from database
- [ ] All 7 products visible
- [ ] Search bar functional
- [ ] Category filter works
- [ ] "Low Stock" badge shows on items with <5 stock
- [ ] Price displays correctly
- [ ] Stock levels visible

### **Admin Dashboard**
- [ ] Accessible at /admin
- [ ] Stats cards visible
- [ ] Orders table visible
- [ ] Low Stock Report visible
- [ ] Edit order buttons work

### **Authentication**
- [ ] Login page accessible
- [ ] Login with `admin@nexusretail.com` / `admin123` works
- [ ] Login with `customer@nexusretail.com` / `customer123` works
- [ ] Invalid credentials fail properly
- [ ] Logged-in user info displays

---

## **Database Verification**

### **Check with MongoDB Shell (Optional)**
- [ ] Open MongoDB shell: `mongosh` or `mongosh <connection-string>`
- [ ] Switch to database: `use nexusretail`
- [ ] Check collections exist:
  - [ ] `show collections` shows: users, products, orders, auditlogs
- [ ] Check user count: `db.users.countDocuments()` returns 3
- [ ] Check product count: `db.products.countDocuments()` returns 7
- [ ] Check audit logs: `db.auditlogs.countDocuments()` returns 7+

### **Check with MongoDB Compass (Optional)**
- [ ] Download & install MongoDB Compass
- [ ] Connect with your connection string
- [ ] Navigate to nexusretail database
- [ ] Verify collections exist:
  - [ ] users (3 docs)
  - [ ] products (7 docs)
  - [ ] auditlogs (7+ docs)
- [ ] Expand a product document and verify fields

---

## **Performance Testing (Optional)**

- [ ] Products load within 2 seconds
- [ ] Search responds in <500ms
- [ ] Filter responds in <500ms
- [ ] No console errors
- [ ] No network errors in browser DevTools

---

## **Final Verification Checklist**

- [ ] All 4 collections exist
- [ ] 3 users created with correct roles
- [ ] 7 products created with correct data
- [ ] Low stock badges display correctly
- [ ] Server runs without errors
- [ ] Client compiles without critical errors
- [ ] Login works with sample credentials
- [ ] Products display in catalog
- [ ] Admin dashboard accessible
- [ ] Database connection confirmed

---

## **Troubleshooting Checklist**

If anything failed:

### **Connection Issues**
- [ ] Verify .env MONGODB_URI is correct
- [ ] Check for typos in connection string
- [ ] Verify IP is whitelisted (Atlas)
- [ ] Verify MongoDB service is running (Local)
- [ ] Restart server after updating .env

### **Data Not Appearing**
- [ ] Run: `npm run seed` again
- [ ] Check seed script output for errors
- [ ] Verify database user has permissions
- [ ] Check that collections are empty before seeding

### **Login Issues**
- [ ] Verify credentials: `admin@nexusretail.com` / `admin123`
- [ ] Check if user was created by running seed again
- [ ] Clear browser cache and try again
- [ ] Check browser console for errors

### **Product Display Issues**
- [ ] Verify products were created: check seed script output
- [ ] Check browser DevTools Network tab for API errors
- [ ] Verify server is running on port 5000
- [ ] Check console for JavaScript errors

---

## **Success Criteria**

✅ **You've succeeded when:**

1. ✅ Server starts without errors
2. ✅ Client loads at http://localhost:3000
3. ✅ Can login with sample credentials
4. ✅ Products display in catalog
5. ✅ Low stock badges show on items with <5 available
6. ✅ Admin dashboard loads
7. ✅ Database contains sample data
8. ✅ No critical errors in console

---

## **Next Steps After Completion**

1. ✅ Database setup complete
2. → Start building features
3. → Implement shopping cart
4. → Add payment integration
5. → Create admin features
6. → Deploy to production

---

## **Documentation Links**

- [ ] Read `README.md` - Project overview
- [ ] Read `DATABASE_SETUP.md` - Detailed setup guide
- [ ] Read `DB_QUICK_REF.md` - Quick commands
- [ ] Read `DB_ARCHITECTURE.md` - Database design
- [ ] Bookmark `MONGODB_COMMANDS.md` - For queries

---

## **Time Log**

- [ ] Start Time: ________
- [ ] Database Setup Complete: ________
- [ ] Data Seeding Complete: ________
- [ ] Server Running: ________
- [ ] Client Running: ________
- [ ] Testing Complete: ________
- [ ] End Time: ________

**Total Time Spent: ________ minutes**

---

**🎉 Congratulations! Your database is ready to use!**

Now you can focus on building amazing features on top of your solid database foundation.

---

*Keep this checklist for reference during development and future setups.*
