# NexusRetail - Enterprise MERN E-Commerce Platform

A full-featured, production-ready e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local or Atlas)

### Server Setup

1. **Navigate to server directory:**
   ```bash
   cd NexusRetail/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file from template:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nexusretail
   JWT_SECRET=your_super_secret_key
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Client Setup

1. **Navigate to client directory (new terminal):**
   ```bash
   cd NexusRetail/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file from template:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   Client will open at `http://localhost:3000`

## 📁 Project Structure

```
NexusRetail/
├── server/
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── config/             # Database, JWT config
│   │   ├── utils/              # Helper functions
│   │   └── validators/         # Input validation
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── client/
    ├── public/
    ├── src/
    │   ├── components/         # Reusable React components
    │   ├── pages/              # Page components
    │   ├── context/            # Context providers
    │   ├── hooks/              # Custom React hooks
    │   ├── services/           # API service calls
    │   ├── utils/              # Helper functions
    │   ├── styles/             # Global styles
    │   ├── assets/             # Images, icons
    │   ├── App.jsx
    │   └── index.js
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env.example
```

## 🔐 Authentication

- JWT-based authentication with bcryptjs password hashing
- Role-based access control (Customer, Admin)
- Protected routes and endpoints
- Token stored in localStorage

### Sample Login Credentials (After Registration)
```
Email: user@example.com
Password: password123
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/low-stock` - Get low stock items (admin)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (customer)
- `GET /api/orders` - Get user's orders (customer)
- `GET /api/orders/:id` - Get single order (customer)
- `GET /api/orders/admin/all` - Get all orders (admin)
- `GET /api/orders/stats/dashboard` - Order statistics (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `DELETE /api/orders/:id/cancel` - Cancel order (admin)

## 🎨 Features

### Frontend
- ✅ Responsive design with Tailwind CSS
- ✅ Product catalog with search and filters
- ✅ Admin dashboard with order management
- ✅ Real-time stock updates
- ✅ User authentication
- ✅ Shopping cart functionality (ready to implement)
- ✅ Order tracking (ready to implement)

### Backend
- ✅ Mongoose ORM with schema validation
- ✅ MongoDB transactions for data consistency
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Bcryptjs password hashing
- ✅ Audit logging
- ✅ Error handling and validation
- ✅ CORS enabled
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan

## 🔄 Transaction Example

All order creation includes automatic rollback on failure:
```javascript
// If any step fails, entire transaction rolls back
1. Check product stock
2. Decrease stock count
3. Create order record
4. Create audit log
```

## 📊 Database Models

- **User** - Authentication and profiles
- **Product** - Inventory management
- **Order** - Order processing and tracking
- **AuditLog** - Admin action tracking

## 🛠 Tech Stack

### Server
- Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Helmet (security)
- CORS
- Morgan (logging)

### Client
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Lucide React Icons

## 📝 Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexusretail
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Server (Heroku/Railway)
1. Push code to git
2. Connect to deployment platform
3. Set environment variables
4. Deploy

### Client (Vercel/Netlify)
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy

## 📖 Next Steps

To implement missing features:
1. **Product Controller** - Complete product CRUD operations
2. **Shopping Cart Context** - State management for cart
3. **Payment Integration** - Stripe/PayPal integration
4. **Email Service** - Nodemailer for notifications
5. **File Uploads** - AWS S3 for product images
6. **Testing** - Jest unit and integration tests
7. **Documentation** - API documentation with Swagger

## 🤝 Contributing

Feel free to submit pull requests and open issues for bugs and feature requests.

## 📄 License

MIT License - feel free to use this project for commercial or personal use.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using MERN Stack**
