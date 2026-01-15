# MongoDB Commands - Copy & Paste Ready

## **Connection Commands**

### **MongoDB Atlas Connection**
```bash
mongosh "mongodb+srv://nexusretail:NexusRetail123!@cluster0.xxxxx.mongodb.net/nexusretail"
```

### **Local MongoDB Connection**
```bash
mongosh -u nexusretail -p NexusRetail123! --authenticationDatabase admin
```

---

## **Database Management**

### **Show All Databases**
```javascript
show databases
```

### **Switch to Database**
```javascript
use nexusretail
```

### **Get Current Database**
```javascript
db.getName()
```

### **Get Database Statistics**
```javascript
db.stats()
```

### **Drop Entire Database**
```javascript
db.dropDatabase()
```

---

## **Collection Operations**

### **List All Collections**
```javascript
show collections
```

### **Get Collection Statistics**
```javascript
db.users.stats()
db.products.stats()
db.orders.stats()
```

### **Count Documents in Collection**
```javascript
db.users.countDocuments()
db.products.countDocuments()
db.orders.countDocuments()
db.auditlogs.countDocuments()
```

---

## **User Queries**

### **Find All Users**
```javascript
db.users.find().pretty()
```

### **Find Admin Users**
```javascript
db.users.find({role: "admin"}).pretty()
```

### **Find Customer Users**
```javascript
db.users.find({role: "customer"}).pretty()
```

### **Find User by Email**
```javascript
db.users.findOne({email: "admin@nexusretail.com"})
```

### **Count Total Users**
```javascript
db.users.countDocuments()
```

### **Find Active Users Only**
```javascript
db.users.find({isActive: true}).pretty()
```

### **Update User Status**
```javascript
db.users.updateOne(
  {email: "customer@nexusretail.com"},
  {$set: {isActive: false}}
)
```

### **Delete a User**
```javascript
db.users.deleteOne({email: "jane@example.com"})
```

---

## **Product Queries**

### **Find All Products**
```javascript
db.products.find().pretty()
```

### **Find Products by Category**
```javascript
db.products.find({category: "Electronics"}).pretty()
db.products.find({category: "Clothing"}).pretty()
db.products.find({category: "Beauty"}).pretty()
```

### **Find Product by SKU**
```javascript
db.products.findOne({sku: "ELEC-001-WH"})
```

### **Find Products on Sale**
```javascript
db.products.find({discountPrice: {$exists: true, $ne: null}}).pretty()
```

### **Find Low Stock Products (< 5 available)**
```javascript
db.products.find({$expr: {$lt: [{$subtract: ["$stock.quantity", "$stock.reserved"]}, 5]}}).pretty()
```

### **Find Products Below Reorder Level**
```javascript
db.products.find({$expr: {$lte: ["$stock.quantity", "$stock.reorderLevel"]}}).pretty()
```

### **Find Active Products Only**
```javascript
db.products.find({isActive: true}).pretty()
```

### **Get Product Price Statistics**
```javascript
db.products.aggregate([
  {$group: {
    _id: null,
    avgPrice: {$avg: "$price"},
    minPrice: {$min: "$price"},
    maxPrice: {$max: "$price"},
    totalProducts: {$sum: 1}
  }}
])
```

### **Find Top Rated Products**
```javascript
db.products.find().sort({"ratings.average": -1}).limit(5).pretty()
```

### **Find Most Reviewed Products**
```javascript
db.products.find().sort({"ratings.count": -1}).limit(5).pretty()
```

### **Update Product Price**
```javascript
db.products.updateOne(
  {sku: "ELEC-001-WH"},
  {$set: {price: 189.99, discountPrice: 139.99}}
)
```

### **Update Product Stock**
```javascript
db.products.updateOne(
  {sku: "ELEC-001-WH"},
  {$set: {"stock.quantity": 100}}
)
```

---

## **Order Queries**

### **Find All Orders**
```javascript
db.orders.find().pretty()
```

### **Find Orders by Status**
```javascript
db.orders.find({deliveryStatus: "delivered"}).pretty()
db.orders.find({deliveryStatus: "pending"}).pretty()
db.orders.find({deliveryStatus: "shipped"}).pretty()
```

### **Find Order by Order Number**
```javascript
db.orders.findOne({orderNumber: "ORD-1705244000000-ABC123XYZ"})
```

### **Find Orders by User ID**
```javascript
db.orders.find({user: ObjectId("65a1234567890abcdef12345")}).pretty()
```

### **Find Orders by Payment Status**
```javascript
db.orders.find({paymentStatus: "completed"}).pretty()
db.orders.find({paymentStatus: "pending"}).pretty()
```

### **Get Orders Summary Stats**
```javascript
db.orders.aggregate([
  {$group: {
    _id: null,
    totalOrders: {$sum: 1},
    totalRevenue: {$sum: "$pricing.total"},
    avgOrderValue: {$avg: "$pricing.total"}
  }}
])
```

### **Get Orders by Status Count**
```javascript
db.orders.aggregate([
  {$group: {_id: "$deliveryStatus", count: {$sum: 1}}},
  {$sort: {count: -1}}
])
```

### **Get Recent Orders (Last 10)**
```javascript
db.orders.find().sort({createdAt: -1}).limit(10).pretty()
```

### **Find Orders in Date Range**
```javascript
db.orders.find({
  createdAt: {
    $gte: new Date("2026-01-01"),
    $lte: new Date("2026-01-31")
  }
}).pretty()
```

---

## **Audit Log Queries**

### **Find All Audit Logs**
```javascript
db.auditlogs.find().pretty()
```

### **Find Admin Actions by User**
```javascript
db.auditlogs.find({adminUser: ObjectId("65a1234567890abcdef12345")}).pretty()
```

### **Find Recent Audit Logs**
```javascript
db.auditlogs.find().sort({createdAt: -1}).limit(20).pretty()
```

### **Find Logs by Action Type**
```javascript
db.auditlogs.find({action: "CREATE"}).pretty()
db.auditlogs.find({action: "UPDATE"}).pretty()
db.auditlogs.find({action: "DELETE"}).pretty()
```

### **Find Failed Actions**
```javascript
db.auditlogs.find({status: "failure"}).pretty()
```

### **Find Critical Severity Logs**
```javascript
db.auditlogs.find({severity: "critical"}).pretty()
```

---

## **Data Cleanup & Reset**

### **Delete All Users**
```javascript
db.users.deleteMany({})
```

### **Delete All Products**
```javascript
db.products.deleteMany({})
```

### **Delete All Orders**
```javascript
db.orders.deleteMany({})
```

### **Delete All Audit Logs**
```javascript
db.auditlogs.deleteMany({})
```

### **Delete Everything (Full Reset)**
```javascript
db.users.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})
db.auditlogs.deleteMany({})
```

---

## **Index Management**

### **List All Indexes**
```javascript
db.users.getIndexes()
db.products.getIndexes()
db.orders.getIndexes()
db.auditlogs.getIndexes()
```

### **Create Custom Index**
```javascript
// Single field index
db.users.createIndex({email: 1})

// Compound index
db.orders.createIndex({user: 1, createdAt: -1})

// Text search index
db.products.createIndex({name: "text", description: "text"})
```

### **Drop Index**
```javascript
db.users.dropIndex({email: 1})
```

---

## **Advanced Queries**

### **Full Text Search Products**
```javascript
db.products.find({$text: {$search: "headphones"}}).pretty()
```

### **Aggregation: Products by Category Count**
```javascript
db.products.aggregate([
  {$group: {_id: "$category", count: {$sum: 1}}},
  {$sort: {count: -1}}
])
```

### **Aggregation: Total Sales by Product**
```javascript
db.orders.aggregate([
  {$unwind: "$items"},
  {$group: {
    _id: "$items.product",
    totalSold: {$sum: "$items.quantity"},
    revenue: {$sum: "$items.subtotal"}
  }},
  {$sort: {revenue: -1}}
])
```

### **Aggregation: Revenue by Month**
```javascript
db.orders.aggregate([
  {$match: {paymentStatus: "completed"}},
  {$group: {
    _id: {$dateToString: {format: "%Y-%m", date: "$createdAt"}},
    revenue: {$sum: "$pricing.total"}
  }},
  {$sort: {_id: -1}}
])
```

---

## **Export & Backup**

### **Export Collection to JSON**
```bash
mongoexport --uri "mongodb+srv://nexusretail:password@cluster.mongodb.net/nexusretail" --collection users --out users.json
mongoexport --uri "mongodb+srv://nexusretail:password@cluster.mongodb.net/nexusretail" --collection products --out products.json
```

### **Import JSON to Database**
```bash
mongoimport --uri "mongodb+srv://nexusretail:password@cluster.mongodb.net/nexusretail" --collection users --file users.json
```

---

## **Performance Tips**

### **Check Query Performance**
```javascript
db.products.find({category: "Electronics"}).explain("executionStats")
```

### **View Slow Queries (Profile)**
```javascript
db.setProfilingLevel(1)  // Log queries > 100ms
db.system.profile.find().pretty()
```

---

**💡 Tip:** Replace `ObjectId("xxxxx")` with actual ID from your database.
