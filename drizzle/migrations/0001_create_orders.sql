-- Orders placed from the public catalog are stored for admin follow-up.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_whatsapp text not null check (char_length(customer_whatsapp) between 10 and 30),
  delivery_address text not null check (char_length(delivery_address) between 10 and 500),
  payment_method text not null check (payment_method in ('Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro')),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total numeric(12,2) not null default 0 check (total >= 0),
  has_quote boolean not null default false,
  status text not null default 'recebido' check (status in ('recebido', 'em_producao', 'pronto', 'entregue', 'cancelado'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_customer_whatsapp_idx on public.orders (customer_whatsapp);

alter table public.orders enable row level security;

-- Customers can create an order, but cannot read other customers' orders.
drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders for insert to anon, authenticated
  with check (
    char_length(customer_name) between 2 and 100
    and char_length(customer_whatsapp) between 10 and 30
    and char_length(delivery_address) between 10 and 500
  );

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
  on public.orders for select to authenticated
  using (public.has_role(_role := 'admin', _user_id := auth.uid()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update to authenticated
  using (public.has_role(_role := 'admin', _user_id := auth.uid()))
  with check (public.has_role(_role := 'admin', _user_id := auth.uid()));

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete to authenticated
  using (public.has_role(_role := 'admin', _user_id := auth.uid()));

grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;