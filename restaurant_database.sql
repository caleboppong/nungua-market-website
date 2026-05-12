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
create policy "Anyone can view restaurant foods"
on restaurant_foods for select
to public
using (true);

drop policy if exists "Admin can manage restaurant foods" on restaurant_foods;
create policy "Admin can manage restaurant foods"
on restaurant_foods for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can view restaurant food images" on restaurant_food_images;
create policy "Anyone can view restaurant food images"
on restaurant_food_images for select
to public
using (true);

drop policy if exists "Admin can manage restaurant food images" on restaurant_food_images;
create policy "Admin can manage restaurant food images"
on restaurant_food_images for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can create restaurant orders" on restaurant_orders;
create policy "Anyone can create restaurant orders"
on restaurant_orders for insert
to public
with check (true);

drop policy if exists "Admin can view restaurant orders" on restaurant_orders;
create policy "Admin can view restaurant orders"
on restaurant_orders for select
to authenticated
using (true);

drop policy if exists "Admin can update restaurant orders" on restaurant_orders;
create policy "Admin can update restaurant orders"
on restaurant_orders for update
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can create restaurant order items" on restaurant_order_items;
create policy "Anyone can create restaurant order items"
on restaurant_order_items for insert
to public
with check (true);

drop policy if exists "Admin can view restaurant order items" on restaurant_order_items;
create policy "Admin can view restaurant order items"
on restaurant_order_items for select
to authenticated
using (true);

grant usage on schema public to anon, authenticated;

grant select on restaurant_foods, restaurant_food_images to anon, authenticated;

grant insert on restaurant_orders, restaurant_order_items to anon, authenticated;

grant select, insert, update, delete
on restaurant_foods, restaurant_food_images, restaurant_orders, restaurant_order_items
to authenticated;

-- Storage policies for food-images bucket
-- Make sure you create a PUBLIC Supabase Storage bucket called: food-images

drop policy if exists "Public can view food images bucket" on storage.objects;
create policy "Public can view food images bucket"
on storage.objects for select
using (bucket_id = 'food-images');

drop policy if exists "Authenticated users can upload food images" on storage.objects;
create policy "Authenticated users can upload food images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'food-images');

drop policy if exists "Authenticated users can update food images" on storage.objects;
create policy "Authenticated users can update food images"
on storage.objects for update
to authenticated
using (bucket_id = 'food-images')
with check (bucket_id = 'food-images');

drop policy if exists "Authenticated users can delete food images" on storage.objects;
create policy "Authenticated users can delete food images"
on storage.objects for delete
to authenticated
using (bucket_id = 'food-images');

-- Remove old sample restaurant menu items
delete from restaurant_foods;

-- Insert Nungua Market restaurant menu

insert into restaurant_foods
(name, category, price, image_url, available, stock, description)
values

-- Starters
('Gizzard', 'Starters', 10.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Deep-fried spiced chicken gizzard with homemade chilli sauce.'),
('Chicken Wings', 'Starters', 8.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Fried chicken wings, ideal for a naughty but nice treat to start off a wonderful meal.'),
('Tsofi', 'Starters', 10.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Deep fried turkey tail seasoned with special spices served with homemade chilli sauces.'),
('Breaded Panko Shrimp', 'Starters', 9.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Golden brown crispy panko shrimp, great for any shrimp lover.'),
('Vegetable Spring Roll', 'Starters', 8.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Crunchy vegetable spring rolls served with chilli sauce.'),
('Tempura Shrimp', 'Starters', 9.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Crispy tempura coating with firm and flavourful shrimp inside.'),
('Kelewele', 'Starters', 8.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Fried plantain cubes sprinkled with spices and fried in hot oil.'),
('Akonfem Half', 'Starters', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Half charcoal-grilled guinea fowl seasoned with chilli and peanut spice.'),
('Akonfem Full', 'Starters', 26.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Full charcoal-grilled guinea fowl seasoned with chilli and peanut spice.'),
('Kebab', 'Starters', 5.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Meat rubbed in spice mix, skewered and grilled. Contains peanuts, ground spices and hot pepper.'),
('Salad', 'Starters', 6.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Fresh beautifully presented salad starter.'),

-- Main Courses
('Jollof with Salad and Plantain', 'Main Courses', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'West African rice dish made with spices and tomato stew. Served with salad and plantain. Chicken, meat, fish or kebab available for extra £4.'),
('Waakye with Salad', 'Main Courses', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Ghanaian rice and beans dish served with salad. Chicken, meat, fish or kebab available for extra £4.'),
('Spinach Stew', 'Main Courses', 18.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Finely chopped spinach cooked with onions, scotch bonnet, tomato and palm oil stew. Best served with boiled yam.'),
('Okro Stew', 'Main Courses', 22.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Palm oil and tomato based stew made with okro. Best served with banku, plain rice or fufu.'),
('Beans Stew and Fried Plantain', 'Main Courses', 18.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Black-eyed beans cooked with onions, pepper and tomatoes in oil, served with fried plantain.'),
('Yam and Kebab', 'Main Courses', 18.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Spiced grilled meat kebab served with fried yam.'),
('Yam and Gizzard', 'Main Courses', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Deep-fried spiced chicken gizzard with homemade chilli sauce served with fried yam.'),
('Tsofi Main', 'Main Courses', 18.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Deep fried turkey tail seasoned with special spices served with homemade chilli sauces.'),
('Tilapia', 'Main Courses', 22.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Freshly grilled tilapia with onions, ginger, garlic and special spices. Served with fried yam, banku, fried plantain, plain rice, waakye or jollof. From £22.'),
('Akonfem Main', 'Main Courses', 18.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Charcoal-grilled guinea fowl seasoned with chilli and peanut spice. Served with fried yam, banku, fried plantain, plain rice, waakye or jollof. From £18.'),
('Tuo Zaafi Weekend Only', 'Main Courses', 22.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Tuo Zaafi served with okro soup. Popular Ghanaian dish from the Northern regions of Ghana. Weekend only.'),

-- Soups
('Light Soup', 'Soups', 26.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Traditional tomato soup made with onions, ginger, garlic and tomato. Best served with fufu.'),
('Abunanbunu Spinach Soup', 'Soups', 28.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Traditional spinach soup made with onions, ginger, garlic and tomato. Best served with fufu.'),
('Nkate Be', 'Soups', 25.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Mixture of palm nut and peanut butter soup.'),
('Nkatenkwan Peanut Soup', 'Soups', 25.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Tomato and peanut blended into a thick delicious soup. Best served with omotuo, fufu or rice.'),
('Otwee Soup', 'Soups', 25.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Traditional tomato soup made with otwee, onions, ginger, garlic and tomato. Best served with fufu.'),

-- Cocktails
('Asor', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Whiskey, pineapple juice, ginger syrup and slice of chilli.'),
('Dumsor', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Whiskey, lime juice, simple syrup, ginger beer and charcoal powder.'),
('Nhs))naa', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Palm wine, rum, limes, mint leaves and Sprite.'),
('Sakwuaba', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Tequila, orange juice, pineapple juice, lemon juice and grenadine.'),
('Sisi Fiaa', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Vodka, lime juice, simple syrup and blue curacao.'),
('Tatata', 'Cocktails', 14.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Vodka, rum, tequila, sweet and sour, blue curacao and Sprite.'),
('Mojito', 'Cocktails', 12.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'White rum, limes, mint leaves, simple syrup, soda water and Sprite.'),
('Pina Colada', 'Cocktails', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Coconut rum, pineapple juice, coconut milk or cream, whipping cream and vanilla essence.'),
('Pornstar Martini', 'Cocktails', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Vanilla vodka, passion fruit liqueur, lime juice and prosecco.'),
('Frozen Strawberry Daiquiri', 'Cocktails', 16.00, '/NunguaMarketRestaurantLogo.jpeg', true, 50, 'Rum, fresh strawberries, strawberry puree, strawberry syrup, lime juice and simple syrup.');