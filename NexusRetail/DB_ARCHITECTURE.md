# NexusRetail Database Architecture

## **Database Structure**

```
┌─────────────────────────────────────────────────────────┐
│          MongoDB - NexusRetail Database                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   USERS          │  │   PRODUCTS       │           │
│  ├──────────────────┤  ├──────────────────┤           │
│  │ _id              │  │ _id              │           │
│  │ firstName        │  │ name             │           │
│  │ lastName         │  │ description      │           │
│  │ email (unique)   │  │ price            │           │
│  │ password (hash)  │  │ discountPrice    │           │
│  │ phone            │  │ category         │           │
│  │ role (customer   │  │ stock {          │           │
│  │        /admin)   │  │   quantity       │           │
│  │ address          │  │   reserved       │           │
│  │ isActive         │  │   reorderLevel   │           │
│  │ totalOrders      │  │ }                │           │
│  │ totalSpent       │  │ images []        │           │
│  │ lastLogin        │  │ ratings          │           │
│  │ timestamps       │  │ sku (unique)     │           │
│  └──────────────────┘  │ createdBy (ref)  │           │
│                        │ timestamps       │           │
│                        └──────────────────┘           │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   ORDERS         │  │   AUDITLOGS      │           │
│  ├──────────────────┤  ├──────────────────┤           │
│  │ _id              │  │ _id              │           │
│  │ orderNumber      │  │ adminUser (ref)  │           │
│  │ user (ref)       │  │ action           │           │
│  │ items [{         │  │ entityType       │           │
│  │   product (ref)  │  │ entityId         │           │
│  │   quantity       │  │ description      │           │
│  │   price          │  │ changes {        │           │
│  │ }]               │  │   before,        │           │
│  │ pricing {        │  │   after          │           │
│  │   subtotal,      │  │ }                │           │
│  │   tax,           │  │ status           │           │
│  │   shipping,      │  │ severity         │           │
│  │   total          │  │ ipAddress        │           │
│  │ }                │  │ timestamps       │           │
│  │ shippingAddress  │  └──────────────────┘           │
│  │ paymentStatus    │                                  │
│  │ deliveryStatus   │                                  │
│  │ trackingNumber   │                                  │
│  │ statusHistory[]  │                                  │
│  │ timestamps       │                                  │
│  └──────────────────┘                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## **Relationships**

```
USER (Admin)
  └── Creates PRODUCTS
      ├── Has many ORDERS (customers)
      │   ├── Contains multiple PRODUCTS
      │   └── Tracked in AUDITLOGS
      │
      └── Creates AUDITLOGS
          ├── Tracks PRODUCT changes
          ├── Tracks ORDER changes
          └── Records admin ACTIONS
```

## **Collection Count After Seeding**

```
Users:       3 documents
Products:    7 documents
Orders:      0 documents (created during usage)
AuditLogs:   7 documents (from seeding actions)
```

## **Indexes Created**

### **Users Collection**
```
{ email: 1 }                          // Fast login lookups
{ role: 1 }                           // Admin/Customer filtering
{ createdAt: -1 }                     // Recent users first
```

### **Products Collection**
```
{ name: "text", description: "text" } // Full-text search
{ category: 1 }                       // Filter by category
{ sku: 1 }                            // Unique SKU lookup
{ stock.quantity: 1 }                 // Stock level queries
{ isActive: 1 }                       // Active products filter
{ createdAt: -1 }                     // Newest products first
```

### **Orders Collection**
```
{ orderNumber: 1 }                    // Order lookup
{ user: 1 }                           // Customer's orders
{ deliveryStatus: 1 }                 // Status filtering
{ paymentStatus: 1 }                  // Payment tracking
{ createdAt: -1 }                     // Recent orders first
{ user: 1, createdAt: -1 }           // User's order timeline
{ entityType: 1, action: 1, createdAt: -1 } // Entity audit trails
```

### **AuditLog Collection**
```
{ adminUser: 1 }                      // Admin's actions
{ action: 1 }                         // Action type filtering
{ entityType: 1 }                     // Entity-specific audits
{ entityId: 1 }                       // Specific entity tracking
{ status: 1 }                         // Success/failure filtering
{ severity: 1 }                       // Critical actions first
{ createdAt: -1 }                     // Latest logs first
{ createdAt: 1 } (TTL: 90 days)      // Auto-delete old logs
```

## **Data Flow**

```
┌─────────────┐
│   CLIENT    │
│  (React)    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────┐
│   SERVER            │
│  (Express.js)       │
├─────────────────────┤
│ • Auth Controller   │
│ • Product Routes    │
│ • Order Routes      │
│ • Middleware        │
└──────┬──────────────┘
       │ Mongoose Query
       ▼
┌─────────────────────────────────┐
│   MONGODB                       │
│                                 │
│ ┌─────────┐ ┌─────────┐       │
│ │ USERS   │ │PRODUCTS │       │
│ └─────────┘ └─────────┘       │
│ ┌─────────┐ ┌─────────┐       │
│ │ ORDERS  │ │AUDITLOG │       │
│ └─────────┘ └─────────┘       │
└────────────────────────────────┘
```

## **Transaction Flow**

### **Order Creation (with Transactions)**

```
1. START TRANSACTION
   ├─ Validate products
   ├─ Check stock levels
   ├─ Calculate pricing
   ├─ Create order document
   ├─ Update product stock
   └─ Log audit entry

2. CHECK FOR ERRORS
   ├─ If success → COMMIT
   └─ If error → ROLLBACK

3. RESPONSE TO CLIENT
```

## **Key Features**

✅ **Relationships:** User → Orders, User → Products (via createdBy), Orders → Products
✅ **Indexes:** Optimized for common queries
✅ **Validation:** Mongoose schema validation
✅ **Transactions:** ACID compliance for order operations
✅ **Audit Trail:** Complete action logging
✅ **TTL Indexes:** Auto-cleanup of old audit logs
✅ **Timestamps:** All documents include createdAt/updatedAt

---

**Database Ready for:**
- ✅ Authentication
- ✅ Product Catalog
- ✅ Order Management
- ✅ Admin Actions
- ✅ Audit Tracking
- ✅ Performance Optimization
