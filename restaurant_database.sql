-- Restaurant department tables and delivery/payment fields
alter table orders add column if not exists fulfilment_method text default 'collection';
alter table orders add column if not exists admin_note text;

create table if not exists restaurant_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  image_url text,
  available boolean not null default true,
  stock integer not null default 0,
  description text,
  created_at timestamptz default now()
);

create table if not exists restaurant_food_images (
  id uuid primary key default gen_random_uuid(),
  food_id uuid references restaurant_foods(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists restaurant_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  customer_postcode text,
  fulfilment_method text not null default 'collection',
  subtotal_price numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  status text not null default 'new',
  payment_status text not null default 'pending',
  admin_note text,
  created_at timestamptz default now()
);

create table if not exists restaurant_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references restaurant_orders(id) on delete cascade,
  food_id uuid references restaurant_foods(id),
  quantity integer not null,
  price numeric(10,2) not null
);

alter table restaurant_foods enable row level security;
alter table restaurant_food_images enable row level security;
alter table restaurant_orders enable row level security;
alter table restaurant_order_items enable row level security;

drop policy if exists "Anyone can view restaurant foods" on restaurant_foods;
create policy "Anyone can view restaurant foods" on restaurant_foods for select to public using (true);

drop policy if exists "Admin can manage restaurant foods" on restaurant_foods;
create policy "Admin can manage restaurant foods" on restaurant_foods for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can view restaurant food images" on restaurant_food_images;
create policy "Anyone can view restaurant food images" on restaurant_food_images for select to public using (true);

drop policy if exists "Admin can manage restaurant food images" on restaurant_food_images;
create policy "Admin can manage restaurant food images" on restaurant_food_images for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can create restaurant orders" on restaurant_orders;
create policy "Anyone can create restaurant orders" on restaurant_orders for insert to public with check (true);

drop policy if exists "Admin can view restaurant orders" on restaurant_orders;
create policy "Admin can view restaurant orders" on restaurant_orders for select to authenticated using (true);

drop policy if exists "Admin can update restaurant orders" on restaurant_orders;
create policy "Admin can update restaurant orders" on restaurant_orders for update to authenticated using (true) with check (true);

drop policy if exists "Anyone can create restaurant order items" on restaurant_order_items;
create policy "Anyone can create restaurant order items" on restaurant_order_items for insert to public with check (true);

drop policy if exists "Admin can view restaurant order items" on restaurant_order_items;
create policy "Admin can view restaurant order items" on restaurant_order_items for select to authenticated using (true);

grant usage on schema public to anon, authenticated;
grant select on restaurant_foods, restaurant_food_images to anon, authenticated;
grant insert on restaurant_orders, restaurant_order_items to anon, authenticated;
grant select, insert, update, delete on restaurant_foods, restaurant_food_images, restaurant_orders, restaurant_order_items to authenticated;

-- Create a PUBLIC Supabase Storage bucket called: food-images
-- Then run these storage policies:
drop policy if exists "Public can view food images bucket" on storage.objects;
create policy "Public can view food images bucket" on storage.objects for select using (bucket_id = 'food-images');

drop policy if exists "Authenticated users can upload food images" on storage.objects;
create policy "Authenticated users can upload food images" on storage.objects for insert to authenticated with check (bucket_id = 'food-images');

drop policy if exists "Authenticated users can update food images" on storage.objects;
create policy "Authenticated users can update food images" on storage.objects for update to authenticated using (bucket_id = 'food-images') with check (bucket_id = 'food-images');

drop policy if exists "Authenticated users can delete food images" on storage.objects;
create policy "Authenticated users can delete food images" on storage.objects for delete to authenticated using (bucket_id = 'food-images');

insert into restaurant_foods (name, category, price, image_url, available, stock, description) values
('Jollof Rice with Chicken','Rice Dishes',9.99,'/NunguaMarketRestaurantLogo.jpeg',true,20,'Classic Ghanaian jollof served with chicken.'),
('Waakye Special','Main Meals',10.99,'/NunguaMarketRestaurantLogo.jpeg',true,15,'Waakye with sides and sauce.'),
('Banku and Tilapia','Main Meals',14.99,'/NunguaMarketRestaurantLogo.jpeg',true,10,'Grilled tilapia served with banku and pepper.'),
('Light Soup with Fufu','Soups',12.99,'/NunguaMarketRestaurantLogo.jpeg',true,12,'Traditional soup served with fufu.')
on conflict do nothing;