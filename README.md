# Taipei Day Trip

A travel booking platform that allows users to browse Taipei attractions, reserve tours, and complete online payments. Users can explore top attractions, choose a preferred time slot, and securely book a trip.

---

##  Project Showcase

### Home Page
- Image carousel and categorized search
- Attraction cards with thumbnails and titles

### Attraction Detail Page
- Image slider, attraction description, and booking options (date / AM or PM)

### Booking & Payment Page
- Displays booking details and total amount
- Collects contact info and credit card information (via TapPay)

### Success Page
- Displays order ID and payment status

---

##  Tech Stack

### 🔹 Frontend
- HTML5 / CSS3 / JavaScript (ES6)
- Custom UI components
- Fetch API for backend communication
- Frontend slider, form validation, and dynamic rendering

### 🔹 Backend
- Python + FastAPI
- RESTful API design
- Session-based and JWT authentication
- Modular routers (`routers/`)
  - `attractions.py`: API for attraction listings and details
  - `booking.py`: Booking APIs
  - `pay.py`: Payment processing with TapPay
  - `Login.py`: User registration and login

### 🔹 Database
- MySQL
  - Connection pooling for performance (`database/DB.py`)
  - SQL query module (`database/SQL.py`)

### 🔹 Payment
- TapPay SDK integration (test card and CCV verification)

---

##  Project Structure

```
Phase 2 Project/
├── data/                    # Static data
├── database/                # DB connection and queries
│   ├── DB.py
│   └── SQL.py
├── routers/                 # FastAPI router modules
│   ├── attractions.py
│   ├── booking.py
│   ├── Login.py
│   └── pay.py
├── static/                  # Static frontend files (js / css / images)
├── app.py                   # FastAPI entry point
├── .gitignore
```

##  Test Account

| Email         | Password  |
|---------------|-----------|
| test@gmail.com | 1234  |

---

##  Features

- Browse and search attractions in real-time
- View detailed attraction info and booking options
- User registration / login / logout
- JWT authentication
- Tour booking process
- TapPay payment integration
- Success confirmation page with order ID

---

##  Notes

- TapPay is in test mode. No real charges will be made.
- Do NOT use real credit card information.
- Login is required to proceed with bookings and payments.

---
