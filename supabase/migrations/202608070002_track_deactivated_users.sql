-- Distingue las cuentas pendientes de habilitación de las suspendidas por un administrador.
alter table public.users add column if not exists deactivated_at timestamptz;

create or replace function public.set_user_deactivated_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'inactive'::public.account_status and old.status = 'active'::public.account_status then
    new.deactivated_at = now();
  elsif new.status = 'active'::public.account_status then
    new.deactivated_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists users_set_deactivated_at on public.users;
create trigger users_set_deactivated_at
  before update of status on public.users
  for each row execute function public.set_user_deactivated_at();
