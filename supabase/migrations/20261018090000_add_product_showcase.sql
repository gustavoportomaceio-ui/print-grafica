-- Add an explicit destination for each item in the public catalog.
alter table public.products
  add column if not exists showcase text not null default 'produtos';

update public.products
set showcase = 'servicos'
where lower(name) like '%cartão de visita%'
   or lower(name) like '%cartao de visita%'
   or lower(name) like '%panfleto%'
   or lower(name) like '%flyer%'
   or lower(name) = 'banner';

alter table public.products
  add constraint products_showcase_check
  check (showcase in ('servicos', 'produtos'));
