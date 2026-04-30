-- Fix: "Admins can view all profiles" referenced profiles from within profiles,
-- causing infinite recursion whenever any admin policy evaluated.
-- Solution: security definer function that bypasses RLS to check admin role.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

-- profiles
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- collections
drop policy if exists "Admins can manage collections" on collections;
create policy "Admins can manage collections"
  on collections for all using (is_admin());

-- products
drop policy if exists "Admins can manage products" on products;
create policy "Admins can manage products"
  on products for all using (is_admin());

-- product_images
drop policy if exists "Admins can manage product images" on product_images;
create policy "Admins can manage product images"
  on product_images for all using (is_admin());

-- product_sizes
drop policy if exists "Admins can manage product sizes" on product_sizes;
create policy "Admins can manage product sizes"
  on product_sizes for all using (is_admin());

-- product_collections
drop policy if exists "Admins can manage product collections" on product_collections;
create policy "Admins can manage product collections"
  on product_collections for all using (is_admin());

-- outfit_pairings
drop policy if exists "Admins can manage outfit pairings" on outfit_pairings;
create policy "Admins can manage outfit pairings"
  on outfit_pairings for all using (is_admin());

-- orders
drop policy if exists "Admins can manage all orders" on orders;
create policy "Admins can manage all orders"
  on orders for all using (is_admin());

-- order_items
drop policy if exists "Admins can manage all order items" on order_items;
create policy "Admins can manage all order items"
  on order_items for all using (is_admin());

-- storage
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update using (bucket_id = 'product-images' and is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete using (bucket_id = 'product-images' and is_admin());
