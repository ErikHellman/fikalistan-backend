-- Fikalistan: tabellen för fikaposter.

create table public.fikaposter (
  id uuid primary key default gen_random_uuid(),
  namn text not null
    constraint fikaposter_namn_langd check (char_length(namn) between 1 and 40),
  bidrag text not null
    constraint fikaposter_bidrag_langd check (char_length(bidrag) between 1 and 100),
  skapad timestamptz not null default now()
);

-- Listan visas med de nyaste posterna först.
create index fikaposter_skapad_idx on public.fikaposter (skapad desc);

-- Row Level Security på, utan några policyer: varken anon eller authenticated
-- når något. Backenden använder den hemliga nyckeln, som går förbi RLS.
alter table public.fikaposter enable row level security;

-- Extra säkerhet: ta bort alla rättigheter för de publika rollerna.
revoke all on table public.fikaposter from anon, authenticated;
