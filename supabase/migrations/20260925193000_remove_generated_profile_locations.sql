update public.noir_profiles
set location = '', updated_at = now()
where location in ('Amsterdam', 'Amsterdam Centrum', 'Amsterdam Chapter');
