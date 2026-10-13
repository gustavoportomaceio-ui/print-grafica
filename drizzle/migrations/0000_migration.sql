create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Outros',
  description text not null default '',
  image_url text,
  base_price numeric,
  price_note text default '',
  options jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active" on public.products for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin insert" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Gráfica Prisma',
  whatsapp text not null default '',
  tagline text not null default 'Impressão de qualidade, entrega rápida.'
);
grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.settings(id) values (1);

insert into public.products (name, category, description, image_url, base_price, price_note, featured, sort_order, options) values
('Cartão de Visita', 'Cartões', 'Cartões em papel couché 300g com impressão colorida de alta definição. Causa ótima primeira impressão.', '/images/cartao.jpg', 49.90, '', true, 1,
 '[{"name":"Quantidade","choices":[{"label":"100 unidades","price":0},{"label":"500 unidades","price":40},{"label":"1000 unidades","price":70}]},{"name":"Impressão","choices":[{"label":"Frente","price":0},{"label":"Frente e verso","price":20}]},{"name":"Acabamento","choices":[{"label":"Brilho","price":0},{"label":"Fosco","price":10},{"label":"Laminação fosca + verniz localizado","price":45}]}]'),
('Panfleto', 'Panfletos e Flyers', 'Panfletos em papel couché 90g, ideais para divulgação em massa com ótimo custo-benefício.', '/images/panfleto.jpg', 89.90, '', true, 2,
 '[{"name":"Tamanho","choices":[{"label":"A6 (10x15cm)","price":0},{"label":"A5 (15x21cm)","price":40},{"label":"A4 (21x29,7cm)","price":110}]},{"name":"Quantidade","choices":[{"label":"1000 unidades","price":0},{"label":"2500 unidades","price":90},{"label":"5000 unidades","price":160}]},{"name":"Impressão","choices":[{"label":"Frente","price":0},{"label":"Frente e verso","price":35}]}]'),
('Flyer Premium', 'Panfletos e Flyers', 'Flyers em papel 150g com acabamento sofisticado para eventos, festas e lançamentos.', '/images/flyer.jpg', 129.90, '', false, 3,
 '[{"name":"Tamanho","choices":[{"label":"10x15cm","price":0},{"label":"15x21cm","price":50}]},{"name":"Quantidade","choices":[{"label":"500 unidades","price":0},{"label":"1000 unidades","price":60}]},{"name":"Acabamento","choices":[{"label":"Brilho","price":0},{"label":"Laminação fosca","price":40}]}]'),
('Banner', 'Banners e Lonas', 'Banner em lona 440g com bastão, ponteira e cordão. Pronto para pendurar.', '/images/banner.jpg', 69.90, '', true, 4,
 '[{"name":"Tamanho","choices":[{"label":"60x90cm","price":0},{"label":"80x120cm","price":30},{"label":"100x150cm","price":60}]},{"name":"Acabamento","choices":[{"label":"Bastão e cordão","price":0},{"label":"Ilhós","price":0}]}]'),
('Adesivo Personalizado', 'Adesivos', 'Adesivos em vinil com corte especial no formato que você quiser. Resistentes à água.', '/images/adesivo.jpg', 59.90, '', true, 5,
 '[{"name":"Tamanho","choices":[{"label":"5x5cm","price":0},{"label":"10x10cm","price":35}]},{"name":"Quantidade","choices":[{"label":"100 unidades","price":0},{"label":"500 unidades","price":80}]},{"name":"Material","choices":[{"label":"Vinil branco","price":0},{"label":"Vinil transparente","price":15}]}]'),
('Lona para Fachada', 'Banners e Lonas', 'Lona de alta resistência para fachadas e eventos. Preço por metro quadrado — consulte medidas.', '/images/lona.jpg', null, 'Sob consulta', false, 6,
 '[{"name":"Acabamento","choices":[{"label":"Com ilhós","price":0},{"label":"Com bainha","price":0},{"label":"Sem acabamento","price":0}]},{"name":"Instalação","choices":[{"label":"Sem instalação","price":0},{"label":"Com instalação","price":0}]}]');
