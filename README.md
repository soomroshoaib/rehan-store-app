# Rehan Store (MERN E-commerce)

A complete online store for creams, shoes, body sprays and more.
**Stack:** MongoDB, Express, React (Vite), Node.js

## Features
- Customer: register/login, product search, category filter, sort, cart, checkout, apne orders
- Payment: Cash on Delivery, Easypaisa, JazzCash
- Admin panel: dashboard, products (add/edit/delete + image upload), orders, payment verification, order status
- Server-side price aur stock check, cancel par stock wapas

## Running locally

Requires Node.js 18+ and MongoDB (local or MongoDB Atlas).

```bash
# Backend
cd server
npm install
cp .env.example .env     # then fill in your values
npm run seed             # admin account + sample products
npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

### Admin login
Use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (default: `admin@rehanstore.com` / `Admin@12345`).
**Change the password and use a long random `JWT_SECRET` before going live.**

## How Easypaisa / JazzCash works
Payments are verified manually for now:
1. At checkout the customer sees your Easypaisa/JazzCash number (set in `.env`).
2. They send the money and enter the **Transaction ID**.
3. In Admin > Orders the order shows "Awaiting verification". Check the payment in your app/SMS and click **"Payment received"**.

Instant automatic payments need an official merchant account:
- **JazzCash:** JazzCash Merchant account (Integrity salt, Merchant ID, Password)
- **Easypaisa:** Easypaisa Business/Merchant account (Store ID, Hash Key)

Once you have the credentials, add the gateway redirect/callback in `server/routes/orders.js`.

## Folder structure
```
server/  models, routes (auth, products, orders, admin), middleware, seed.js
client/  src/pages (shop + admin), components, context (auth, cart)
api/     Vercel serverless entry point
```

## Deploying to Vercel
1. Push this folder to a GitHub repository and import it in Vercel (root directory `./`).
2. Add these Environment Variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EASYPAISA_NUMBER`, `EASYPAISA_TITLE`, `JAZZCASH_NUMBER`, `JAZZCASH_TITLE`.
3. In MongoDB Atlas > Network Access, allow access from anywhere (0.0.0.0/0).
4. Product images are stored in MongoDB, so they persist on Vercel.
