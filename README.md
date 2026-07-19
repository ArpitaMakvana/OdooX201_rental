# 🏠 RentFlow - Rental Management System

A modern full-stack Rental Management System developed for the OdooX201 Hackathon. The platform streamlines property rental operations for vendors and customers by providing secure authentication, property management, booking workflows, and an intuitive dashboard.

---

## 🚀 Features

### 👤 User Features
- User Registration & Login
- Secure JWT Authentication
- Browse Rental Properties
- Search & Filter Listings
- Property Details Page
- Book Rental Properties
- Wishlist Management
- Booking History
- User Profile Management

### 🏢 Vendor Features
- Vendor Registration & Login
- Vendor Dashboard
- Add New Property
- Edit Property Details
- Delete Property
- View Bookings
- Manage Rental Inventory
- Customer Management
- Booking Status Updates

### 🔐 Authentication
- JWT-based Authentication
- Password Encryption using bcrypt
- Role-Based Access Control (RBAC)
- Protected Routes

---

# 🛠 Tech Stack

## Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt

## Database
- PostgreSQL

---

# 📂 Project Structure

```
RentFlow/
│
├── rentflow-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── rentflow-backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/ArpitaMakvana/OdooX201_rental.git
```

```bash
cd OdooX201_rental
```

---

## Backend Setup

```bash
cd rentflow-backend
```

Install dependencies

```bash
npm install
```

Configure environment variables

Create a `.env` file

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/rentflow
JWT_SECRET=your_secret_key
PORT=5000
```

Run Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd rentflow-frontend
```

Install dependencies

```bash
npm install
```

Run Frontend

```bash
npm run dev
```

---

# 🗄 Database

PostgreSQL is used as the primary relational database.

Features include:

- User Management
- Vendor Management
- Property Listings
- Booking Records
- Authentication Data

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Authorization
- Protected API Routes
- Environment Variables

---

# 📸 Screenshots

> Add project screenshots here after completing the UI.

---

# 👨‍💻 Team

Developed during **OdooX201 Hackathon**

### Contributors

- Arpita Makvana
- Aabha Thanki
- Zeel Kanudawala
- Krish Joshi

---

# 📌 Future Improvements

- Online Payment Integration
- Email Notifications
- Rental Agreement Generation
- Admin Dashboard
- Analytics Dashboard
- AI-based Property Recommendation
- Chat Support
- Review & Rating System
- Google Maps Integration

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
