# 🌱 Smart Food Redistribution System

A full-stack web application that connects food donors with NGOs and volunteers to reduce food waste using intelligent matching, real-time updates, and location-based services.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 📋 Table of Contents

- [Abstract](#-abstract)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [API Documentation](#-api-documentation)
- [Future Scope](#-future-scope)

---

## 📝 Abstract

The **Smart Food Redistribution System** is a web-based platform designed to address the critical issue of food wastage by facilitating the efficient redistribution of surplus food. The system leverages modern web technologies including React.js, Node.js, Express, and MongoDB to create an intelligent food-sharing network. By incorporating geospatial queries, smart matching algorithms, and real-time notifications, the platform ensures that excess food from donors reaches NGOs and volunteers before expiry, thereby reducing food waste and addressing hunger simultaneously.

## 📌 Introduction

Approximately one-third of all food produced globally is wasted — around 1.3 billion tonnes per year (FAO). At the same time, millions of people go hungry daily. This paradox highlights a critical distribution problem rather than a production shortage.

The Smart Food Redistribution System bridges this gap by providing a technology-driven solution that:
- Enables food donors (restaurants, events, individuals) to list surplus food
- Matches donations with nearby NGOs using geospatial algorithms  
- Prioritizes food based on expiry urgency
- Provides real-time tracking from listing to delivery

## ❓ Problem Statement

Current food redistribution efforts face several challenges:
1. **Lack of coordination** between food donors and recipients
2. **Time constraints** — surplus food has limited shelf life
3. **Location inefficiency** — no automated way to match nearby donors and recipients
4. **No tracking system** — once food is donated, status visibility is lost
5. **Communication gaps** — no centralized alert system for available food

This system addresses all these pain points through intelligent automation and real-time connectivity.

---

## ✨ Features

### 🥗 For Donors
- Register and add food donations with details, photos, location
- GPS-based location detection
- Track donation status (Pending → Accepted → Picked → Delivered)
- Dashboard with personal donation statistics

### 🚚 For NGOs / Volunteers
- View nearby available donations sorted by distance and urgency
- Accept donations with one click
- Interactive map view with donation markers
- Update donation status (picked up / delivered)

### 🛡 For Admins
- Dashboard with analytics (total donations, users, food saved)
- Manage users (activate/deactivate/delete)
- Monitor all donations across the platform

### 🧠 Smart Features
- **Geospatial matching** using MongoDB `$geoNear`
- **Priority scoring** (60% expiry urgency + 40% distance)
- **Toast notifications** for donation status updates
- **Role-based access control** with JWT authentication

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│          CLIENT (React + Vite)              │
│   Landing | Auth | Dashboards | Map View    │
│                  │ Axios                    │
└──────────────────┼──────────────────────────┘
                   │
          ┌────────▼────────┐
          │   Express.js    │
          │   REST API      │
          ├─────────────────┤
          │  JWT Auth       │
          │  Role Middleware │
          │  Error Handler  │
          └────────┬────────┘
                   │
    ┌──────────────┼───────────────┐
    │              │               │
┌───▼────┐  ┌─────▼─────┐  ┌─────▼─────┐
│MongoDB │  │Cloudinary │  │OpenStreet │
│(Atlas) │  │(Images)   │  │Map(Leaflet)│
└────────┘  └───────────┘  └───────────┘
```

### Pattern: MVC (Model-View-Controller)
- **Models**: Mongoose schemas (User, Donation, Notification)
- **Views**: React components
- **Controllers**: Express route handlers

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, React Router |
| Styling | Vanilla CSS (Custom Design System) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Maps | Leaflet + OpenStreetMap |
| Image Upload | Cloudinary + Multer |
| HTTP Client | Axios |
| Notifications | react-hot-toast |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Mini Project SFD"
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

### 4. Create Admin User
Use the API or MongoDB directly to create an admin:
```bash
# POST http://localhost:5000/api/auth/register
{
  "name": "Admin",
  "email": "admin@sfd.com",
  "password": "password123",
  "role": "admin"
}
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/donations` | Create donation |
| GET | `/api/donations` | List donations |
| GET | `/api/donations/:id` | Get donation detail |
| PUT | `/api/donations/:id` | Update donation |
| DELETE | `/api/donations/:id` | Delete donation |
| PUT | `/api/donations/:id/accept` | Accept donation (NGO) |
| PUT | `/api/donations/:id/status` | Update status (NGO) |
| GET | `/api/donations/nearby` | Get nearby donations |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/donations` | All donations |

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## 📊 Database Schema

### User
- name, email, password (hashed), role, phone, organization, location (GeoJSON), address

### Donation
- donor (ref), foodName, quantity, unit, expiryTime, image, location (GeoJSON), status, acceptedBy (ref)

### Notification
- user (ref), type, message, donation (ref), read

---

## 🔮 Future Scope

1. **Mobile App** — React Native version for on-the-go access
2. **AI Prediction** — Machine learning to predict food surplus patterns
3. **Blockchain** — Immutable donation tracking for transparency
4. **Multi-language** — i18n support for regional adoption
5. **Payment Integration** — For premium features or logistics sponsorship
6. **IoT Integration** — Smart sensors for food freshness monitoring
7. **Government Dashboard** — Analytics for policy makers

---

## 📄 Conclusion

The Smart Food Redistribution System demonstrates how technology can effectively address the food waste crisis by connecting donors with recipients through an intelligent, automated platform. The combination of geospatial matching, priority-based algorithms, and real-time tracking creates a seamless experience that makes food redistribution efficient and impactful.

The system is built with scalability in mind, using a modern MERN stack architecture that can be extended with additional features like AI prediction, mobile apps, and IoT integration as the platform grows.

---

## 📜 License

This project is developed for academic purposes.

---

*Built with ❤️ for communities everywhere*
