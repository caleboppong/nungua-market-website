create table if not exists products (
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

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  total_price numeric(10,2) not null,
  status text not null default 'new',
  payment_status text not null default 'pay_on_collection',
  created_at timestamptz default now()
);

alter table orders add column if not exists user_id uuid;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists payment_status text default 'pay_on_collection';

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price numeric(10,2) not null
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table contact_messages enable row level security;

drop policy if exists "Anyone can view products" on products;
create policy "Anyone can view products" on products for select using (true);

drop policy if exists "Admin can manage products" on products;
create policy "Admin can manage products" on products for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can view product images" on product_images;
create policy "Anyone can view product images" on product_images for select using (true);

drop policy if exists "Admin can manage product images" on product_images;
create policy "Admin can manage product images" on product_images for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can create orders" on orders;
create policy "Anyone can create orders" on orders for insert with check (true);

drop policy if exists "Admin can view all orders" on orders;
create policy "Admin can view all orders" on orders for select to authenticated using (true);

drop policy if exists "Admin can update orders" on orders;
create policy "Admin can update orders" on orders for update to authenticated using (true) with check (true);

drop policy if exists "Anyone can create order items" on order_items;
create policy "Anyone can create order items" on order_items for insert with check (true);

drop policy if exists "Admin can view order items" on order_items;
create policy "Admin can view order items" on order_items for select to authenticated using (true);

drop policy if exists "Anyone can send contact messages" on contact_messages;
create policy "Anyone can send contact messages" on contact_messages for insert with check (true);

drop policy if exists "Admin can view contact messages" on contact_messages;
create policy "Admin can view contact messages" on contact_messages for select to authenticated using (true);

drop policy if exists "Public can view product images bucket" on storage.objects;
create policy "Public can view product images bucket" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

insert into products (name, category, price, image_url, available, stock, description) values
('Tasty Tom Jollof Mix','Cooking Ingredients',3.99,'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=900&auto=format&fit=crop',true,25,'Tomato mix for jollof rice and stews.'),
('Ghana Gari','Grains & Flour',4.50,'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',true,40,'Quality gari for soaking, eba, and meals.'),
('Plantain','Fresh Produce',1.20,'https://images.unsplash.com/photo-1603052875302-d376b7c0638a?q=80&w=900&auto=format&fit=crop',true,60,'Fresh plantain sold per piece.'),
('Fufu Flour','Grains & Flour',5.99,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=900&auto=format&fit=crop',true,18,'Smooth fufu flour for traditional meals.'),
('Palm Oil','Oils & Sauces',6.99,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=900&auto=format&fit=crop',false,0,'Rich red palm oil for soups and stews.')
on conflict do nothing;