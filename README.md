# Nungua Market Full E-commerce Starter

This version includes:
- Customer shop
- Customer login / signup
- Basket and checkout/order placement
- Supabase database
- Admin login
- Admin add/edit/delete products
- Admin upload product images through the website
- Multiple product images per product
- Admin order dashboard
- Update order status
- Simple dashboard analytics
- Stripe placeholder button/payment link support

## Setup

### 1. Install
npm install

### 2. Supabase database
Open Supabase > SQL Editor and run `database.sql`.

### 3. Supabase Storage
Open Supabase > Storage > Create bucket.

Bucket name:
product-images

Make it Public.

### 4. Admin login
Open Supabase > Authentication > Users > Add user.
Create your admin email/password.

### 5. Environment variables
Rename `.env.example` to `.env`.

Add:
VITE_SUPABASE_URL=your Supabase project URL
VITE_SUPABASE_ANON_KEY=your Supabase anon public key

### 6. Run
npm run dev

Open:
http://localhost:5173

## Image upload
Log in as admin, open Admin Products, then add or edit a product.
Choose one or more image files and click upload/save.

## Stripe
This starter includes a payment link placeholder.
For real card payment, create a Stripe Payment Link and add it to `.env`:

VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-payment-link

For advanced Stripe Checkout with exact basket amount, you need a backend/serverless function.

## Contact page
This version includes:
- Public Contact tab
- Contact form saved to Supabase
- Admin Messages tab to view contact messages

Run the corrected SQL that creates `contact_messages` before testing.
