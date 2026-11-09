alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'user'));

drop policy if exists "Users can update their own profile" on public.profiles;
revoke update on public.profiles from authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.products enable row level security;
grant select, insert, update, delete on public.products to authenticated;

drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products"
  on public.products for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product"
  on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product"
  on public.products for delete to authenticated
  using (public.is_admin());
