```bash


-- TABLES
-- ------------------------------------------------------------

-- watchlists: one row per watchlist, linked to a user
create table watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text,
  description text,
  colour text,
  tags text[] default '{}',
  share_token uuid unique default null,
  created_at timestamptz default now()
);
 
-- watchlist_movies: junction table, one row per movie per watchlist
create table watchlist_movies (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid references watchlists(id) on delete cascade,
  movie_id int4,
  added_at timestamptz default now()
);
 
-- favourites: one row per favourited movie per user
create table favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  movie_id int4,
  added_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
 
alter table profiles enable row level security;
alter table watchlists enable row level security;
alter table watchlist_movies enable row level security;
alter table favourites enable row level security;



-- FUNCTIONS
-- ------------------------------------------------------------

-- Create a function that runs on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create the profiles table first
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- Create a function that runs on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Attach the function to auth.users so it fires on every new signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();



-- POLICIES
-- ------------------------------------------------------------

-- PROFILES: users can only read and update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- WATCHLISTS: Access watchlists
create policy "Users can view own watchlists"
  on watchlists for select
  using (auth.uid() = user_id);

create policy "Users can create watchlists"
  on watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watchlists"
  on watchlists for update
  using (auth.uid() = user_id);

create policy "Users can delete own watchlists"
  on watchlists for delete
  using (auth.uid() = user_id);

-- WATCHLIST_MOVIES: access via parent watchlist ownership
create policy "Users can view own watchlist movies"
  on watchlist_movies for select
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_movies.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

create policy "Users can add movies to own watchlists"
  on watchlist_movies for insert
  with check (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_movies.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

create policy "Users can remove movies from own watchlists"
  on watchlist_movies for delete
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_movies.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

-- FAVOURITES: Accesss favourites
create policy "Users can view own favourites"
  on favourites for select
  using (auth.uid() = user_id);

create policy "Users can add favourites"
  on favourites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove favourites"
  on favourites for delete
  using (auth.uid() = user_id);


-- add column to be able to share a watchlist with an url
alter table watchlists add column share_token uuid unique default null;

-- Shared watchlists are readable by anyone.
-- Privacy is enforced by the share_token UUID being unguessable (122 bits of entropy).
-- Non-shared watchlists (share_token is null) remain private via this policy.
create policy "Shared watchlists are publicly readable"
  on watchlists for select
  using (share_token is not null);

create policy "Token holders can view shared watchlist movies"
  on watchlist_movies for select
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_movies.watchlist_id
      and watchlists.share_token is not null
    )
  );
````