# Nungua Market Multi-Business Phase 1

This version adds:
- Department landing page: Grocery Shop / Restaurant
- Restaurant menu page
- Restaurant admin food management
- Multiple restaurant food images via `food-images` bucket
- Restaurant basket
- Collection/delivery selection
- Postcode delivery check and automatic delivery fee
- Restaurant orders saved separately from grocery orders

## Supabase setup
1. In Supabase Storage, create a PUBLIC bucket called `food-images`.
2. Run `restaurant_database.sql` in Supabase SQL Editor.

## Important
Restaurant Stripe is NOT connected yet. This is Step 9 and needs a separate Restaurant Stripe secret key/account.

## Test
Run:
```bash
npm install
npm run dev
```
