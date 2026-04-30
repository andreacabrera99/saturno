-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Collections
create table collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table collections enable row level security;

create policy "Anyone can view active collections"
  on collections for select using (is_active = true);

create policy "Admins can manage collections"
  on collections for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  category text not null check (
    category in ('bolsas','chamarras','chicos','faldas','pantalones','playeras-y-tops')
  ),
  is_active boolean not null default true,
  is_archived boolean not null default false,
  care_instructions text,
  fit_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "Anyone can view active products"
  on products for select using (is_active = true and is_archived = false);

create policy "Admins can manage products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute procedure update_updated_at();

-- Product images
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products on delete cascade,
  url text not null,
  alt text,
  position int not null default 0
);

alter table product_images enable row level security;

create policy "Anyone can view product images"
  on product_images for select using (true);

create policy "Admins can manage product images"
  on product_images for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Product sizes
create table product_sizes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products on delete cascade,
  size text not null check (size in ('XS','S','M','L','XL','XXL','Única')),
  stock int not null default 0 check (stock >= 0),
  unique (product_id, size)
);

alter table product_sizes enable row level security;

create policy "Anyone can view product sizes"
  on product_sizes for select using (true);

create policy "Admins can manage product sizes"
  on product_sizes for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Product collections (many-to-many)
create table product_collections (
  product_id uuid not null references products on delete cascade,
  collection_id uuid not null references collections on delete cascade,
  primary key (product_id, collection_id)
);

alter table product_collections enable row level security;

create policy "Anyone can view product collections"
  on product_collections for select using (true);

create policy "Admins can manage product collections"
  on product_collections for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Outfit pairings
create table outfit_pairings (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products on delete cascade,
  paired_product_id uuid not null references products on delete cascade,
  check (product_id <> paired_product_id),
  unique (product_id, paired_product_id)
);

alter table outfit_pairings enable row level security;

create policy "Anyone can view outfit pairings"
  on outfit_pairings for select using (true);

create policy "Admins can manage outfit pairings"
  on outfit_pairings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Wishlists
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles on delete cascade,
  product_id uuid not null references products on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table wishlists enable row level security;

create policy "Users can manage own wishlist"
  on wishlists for all using (auth.uid() = user_id);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete set null,
  status text not null default 'pending' check (
    status in ('pending','confirmed','shipped','delivered','cancelled')
  ),
  total numeric(10,2) not null check (total >= 0),
  shipping_name text not null,
  shipping_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_zip text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can create orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Order items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid references products on delete set null,
  product_name text not null,
  product_image text,
  size text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

alter table order_items enable row level security;

create policy "Users can view own order items"
  on order_items for select using (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Users can create order items"
  on order_items for insert with check (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can manage all order items"
  on order_items for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Anyone can view product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert with check (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update product images"
  on storage.objects for update using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete product images"
  on storage.objects for delete using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
