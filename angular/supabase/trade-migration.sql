-- Migración aditiva para habilitar ventas y trueques sin modificar los datos existentes.
alter table public.products
  add column if not exists listing_type text not null default 'Venta';

alter table public.products
  add column if not exists trade_wishlist text;

do $$
begin
  alter table public.products
    add constraint products_listing_type_check
    check (listing_type in ('Venta', 'Intercambio'));
exception when duplicate_object then
  null;
end;
$$;
