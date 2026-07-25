# WatchingYou - Developer Documentation

First off, thanks for taking the time to contribute! 

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [File Reference](#file-reference)
- [Data Model](#data-model)
- [Authentication Flow](#authentication-flow)
- [State Management](#state-management)
- [Adding New Features](#adding-new-features)
- [Contributing](#contributing)
- [Environment Variables](#environment-variables)
- [Known Issues and Limitations](#known-issues-and-limitations)

---

## Project Overview

WatchingYou is a movie watchlist app. Users can search for movies using the TMDB API, favourite movies, create multiple watchlists, add movies to those watchlists, and share watchlists via a unique link.

The frontend is a React application. The backend is Supabase, which provides a PostgreSQL database, authentication, and row level security.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| Backend and database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Movie data | TMDB API |
| Deployment | Netlify |
---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Supabase account and project
- A TMDB API key (free at themoviedb.org)

### Installation

### 1. Clone the repository  
```bash
git clone <your-repo-url>
cd ReactWatchlist/frontend
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create an `.env` file
- Inside frontend/, add your environment variables:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### Database setup

NEED TO CREATE watchlists, watchlist_movies, AND favourites MANUALLY. CHECK [Data Model](#data-model) FOR DETAILS.

Run the SQL in [supabase-schema](./ReactWatchlist/frontend/src/services/supabase-schema.md) in your Supabase SQL editor. This creates all tables, foreign keys, and RLS policies.




---

## Project Structure

```
src/
├── components/              # Reusable UI pieces used across multiple pages
│   ├── NavBar.jsx           # Top navigation, shows auth state
│   ├── MovieCard.jsx        # Single movie card with favourite and watchlist buttons
│   ├── CreateCard.jsx       # The "+" card in the watchlist grid
│   ├── WatchlistCard.jsx    # Single watchlist card in the grid
│   ├── ProtectedRoute.jsx   # Route wrapper that redirects unauthenticated users
│   └── ErrorBoundary.jsx    # Catches render errors and shows a fallback UI
│
├── pages/                   # Full pages, each maps to a route
│   ├── Home.jsx             # "/" - movie search and browse
│   ├── Favourites.jsx       # "/favourites" - saved favourite movies
│   ├── Watchlists.jsx       # "/watchlists" - grid of all watchlists
│   ├── WatchlistDetail.jsx  # "/watchlists/:watchlistId" - inside one watchlist
│   ├── SharedWatchlist.jsx  # "/shared/:shareToken" - public view of a shared watchlist
│   ├── Login.jsx            # "/login"
│   └── SignUp.jsx           # "/signup"
│
├── contexts/                # React context providers (global state)
│   ├── AuthContext.jsx      # Current user, login, logout, signup
│   └── MovieContext.jsx     # Favourites, watchlists, all CRUD operations
│
├── services/                # External API calls
│   ├── api.js               # TMDB API functions
│   └── supabase.js          # Supabase client initialisation
│
├── css/                     # One CSS file per component or page
│
├── App.jsx                  # Root component, defines all routes
└── main.jsx                 # Entry point, mounts React into the HTML
```

---

## Architecture

### Component tree

```
main.jsx
└── App.jsx
      └── AuthProvider                   (provides user, signIn, signOut, signUp)
      └── MovieProvider              (provides favourites, watchlists, CRUD functions)
            ├── NavBar
            └── Routes
                  ├── "/"              → Home
                  │                       └── MovieCard (many)
                  ├── "/favourites"    → ProtectedRoute → Favourites
                  │                       └── MovieCard (many)
                  ├── "/watchlists"    → ProtectedRoute → Watchlists
                  │                       ├── CreateCard
                  │                       └── WatchlistCard (many)
                  ├── "/watchlists/:id"→ ProtectedRoute → WatchlistDetail
                  │                       └── MovieCard (many)
                  ├── "/shared/:token" → SharedWatchlist
                  │                       └── MovieCard (many)
                  ├── "/login"         → Login
                  └── "/signup"        → SignUp
```

### Data flow

```
Supabase database
      |
      | (on user login, fetch favourites and watchlists)
      v
MovieContext  <-->  local React state (useState arrays)
      |
      | (useMovieContext())
      v
Any component that needs data
```

When a user performs an action (add favourite, create watchlist, etc.), the context function does two things in sequence:

1. Writes the change to Supabase
2. Updates local React state immediately on success, without re-fetching from the database

This is called an optimistic-style update. The UI feels instant because state updates happen locally. If the Supabase call fails, the local state is not updated, so the UI stays consistent with the database.

### Why two contexts

`AuthContext` and `MovieContext` are separate because they have different concerns and different lifetimes. `AuthContext` manages the session and is independent of any movie data. `MovieContext` depends on `AuthContext` because it needs to know which user to fetch data for. Keeping them separate makes each easier to reason about and test independently.

`AuthProvider` wraps `MovieProvider` in `App.jsx` so that `MovieContext` can call `useAuthContext()` and read the current user.

---

## File Reference

### `src/services/supabase.js`

Initialises and exports the Supabase client. Import `supabase` from this file anywhere you need to make a database or auth call. `createClient` is called once here and reused everywhere.

```javascript
import { supabase } from '../services/supabase'
```

### `src/services/api.js`

Three functions for the TMDB API:

| Function | What it does |
|---|---|
| `getPopularMovies()` | Fetches the current popular movies list |
| `searchMovies(query)` | Searches movies by title |
| `getMovieById(id)` | Fetches a single movie by its TMDB ID |

All three are async and return movie objects in the TMDB format. Movie IDs from TMDB are integers.

### `src/contexts/AuthContext.jsx`

Exports `AuthProvider` and `useAuthContext`.

On mount, it calls `supabase.auth.getSession()` to restore any existing session from localStorage. It also sets up a listener via `supabase.auth.onAuthStateChange` so the `user` state updates automatically when the user logs in or out anywhere.

While the session check is in progress, `loading` is `true` and `AuthProvider` renders `null` instead of its children. This prevents a flash of the logged-out state on page load.

Values exposed via `useAuthContext()`:

| Value | Type | Description |
|---|---|---|
| `user` | object or null | The current Supabase user object, or null if not logged in |
| `loading` | boolean | True while the initial session check is running |
| `signUp(email, password)` | async function | Creates a new account |
| `signIn(email, password)` | async function | Signs in with email and password |
| `signOut()` | async function | Signs out and clears the session |

All three auth functions throw on error so the calling component can catch and display the message.

### `src/contexts/MovieContext.jsx`

Exports `MovieProvider` and `useMovieContext`.

Reads `user` from `AuthContext`. When `user` changes (login or logout), it either fetches that user's data from Supabase or clears the local state.

Favourites are stored as a flat array of TMDB movie IDs (integers): `[550, 278, 680]`. Full movie objects are not stored - they are fetched from TMDB when needed.

Watchlists are stored as an array of objects. Each object includes a `movies` field which is a flat array of TMDB movie IDs, reshaped from the `watchlist_movies` join table on fetch.

Values exposed via `useMovieContext()`:

| Value | Description |
|---|---|
| `favourites` | Array of TMDB movie IDs |
| `addToFavourites(movie)` | Inserts into `favourites` table, appends ID to local state |
| `removeFromFavourites(movieId)` | Deletes from `favourites` table, filters local state |
| `isFavourite(movieId)` | Returns boolean |
| `watchlists` | Array of watchlist objects, each with a `movies` array of IDs |
| `createWatchlist()` | Inserts into `watchlists` table, appends to local state |
| `updateWatchlist(id, changes)` | Updates specific columns, merges into local state |
| `deleteWatchlist(id)` | Deletes row and cascades to `watchlist_movies`, filters local state |
| `addMovieToWatchlist(watchlistId, movie)` | Inserts into `watchlist_movies` |
| `removeMovieFromWatchlist(watchlistId, movieId)` | Deletes from `watchlist_movies` |
| `addTag(watchlistId, tag)` | Updates the `tags` text array column |
| `removeTag(watchlistId, tag)` | Updates the `tags` text array column |
| `shareWatchlist(watchlistId)` | Sets a UUID `share_token`, returns the token |
| `unshareWatchlist(watchlistId)` | Sets `share_token` to null |

### `src/components/ProtectedRoute.jsx`

Wraps any route that requires authentication. Reads `user` from `AuthContext`. If `user` is null, redirects to `/login`. Otherwise renders the children as normal.

```jsx
<Route path="/favourites" element={
    <ProtectedRoute><Favourites/></ProtectedRoute>
}/>
```

### `src/components/MovieCard.jsx`

Receives a single `movie` prop in TMDB format. Renders the poster, title, and release year. On hover shows two buttons: a favourite toggle and a watchlist picker dropdown.

The favourite button calls `addToFavourites` or `removeFromFavourites` depending on `isFavourite(movie.id)`.

The watchlist picker renders all watchlists from context as buttons. Clicking one calls `addMovieToWatchlist`. The picker is toggled by local state (`showWatchlistPicker`).

### `src/components/WatchlistCard.jsx`

Receives a single `watchlist` prop. The card itself is clickable and navigates to `/watchlists/:id` via `useNavigate`.

Interactive elements inside the card use `e.stopPropagation()` to prevent their clicks from bubbling up and triggering the card navigation.

Name and description are controlled inputs that call `updateWatchlist` on every keystroke. Tags are rendered as pills with a remove button each, plus an input that adds a new tag on Enter.

The colour picker sits in the card banner. The native colour input is hidden behind a circular div, with the circle colour matching the current watchlist colour.

### `src/pages/WatchlistDetail.jsx`

On mount, reads `watchlistId` from `useParams()`, finds the matching watchlist from context using `.find()`, then fetches all movie objects from TMDB using `Promise.all` on the array of stored IDs.

The fetched movie objects are stored in local state (`movies`). The context only stores IDs. These two stay in sync manually: when a movie is toggled, it updates both context (the ID array via Supabase) and local state (the object array for display) at the same time.

The search section uses a `useRef` attached to the container div and a `mousedown` event listener on `document` to detect clicks outside and dismiss results.

The share button generates a UUID token via `shareWatchlist`, constructs the URL as `window.location.origin + "/shared/" + token`, and writes it to the clipboard via `navigator.clipboard.writeText`.

The screenshot button uses `html2canvas`. Before capturing, it loops through all `img` elements, fetches each via `images.weserv.nl` (a CORS proxy), converts to base64 via `FileReader`, and swaps the `src`. After capture it restores original srcs.

### `src/pages/SharedWatchlist.jsx`

Public page, no auth required. Reads `shareToken` from `useParams()` and queries Supabase directly:

```javascript
supabase.from('watchlists')
    .select('*, watchlist_movies(movie_id)')
    .eq('share_token', shareToken)
    .single()
```

This works without authentication because the RLS policy allows reading any watchlist where `share_token is not null`. The security model relies on the UUID being unguessable rather than on access control.

If no watchlist matches the token (invalid or sharing revoked), sets `notFound` to true and shows an error message.

If the viewer is logged in, shows a "Copy to my watchlists" button. Clicking it inserts a new row into `watchlists` and copies all `watchlist_movies` rows under the new ID.

---

## Data Model

### Tables

**`profiles`**
```
id          uuid    primary key, references auth.users(id) on delete cascade
email       text
created_at  timestamptz
```
Auto-populated by a database trigger when a user signs up. Never written to directly from the app.

**`watchlists`**
```
id           uuid    primary key, default gen_random_uuid()
user_id      uuid    foreign key to profiles.id, on delete cascade
name         text
description  text
colour       text    hex colour string e.g. "#2a2a2a"
tags         text[]  postgres array of tag strings
share_token  uuid    null means not shared, uuid means shared
created_at   timestamptz
```

**`watchlist_movies`**
```
id            uuid    primary key
watchlist_id  uuid    foreign key to watchlists.id, on delete cascade
movie_id      int4    TMDB movie ID
added_at      timestamptz
```
Junction table. One row per movie per watchlist. Cascade means deleting a watchlist removes all its movie rows automatically.

**`favourites`**
```
id        uuid    primary key
user_id   uuid    foreign key to profiles.id, on delete cascade
movie_id  int4    TMDB movie ID
added_at  timestamptz
```

### RLS policies summary

All tables have RLS enabled. The policies enforce:

- Users can only read, insert, update, and delete their own rows in `watchlists` and `favourites`
- `watchlist_movies` access is derived from watchlist ownership
- Watchlists where `share_token is not null` are readable by anyone (the share feature)
- `profiles` is readable and updatable only by the owning user

### Shape of data in context vs database

The database stores movies as rows in `watchlist_movies`. The context reshapes this on fetch into a flat array of integers on each watchlist object:

```javascript
// Database: watchlist_movies rows
{ watchlist_id: "abc", movie_id: 550 }
{ watchlist_id: "abc", movie_id: 278 }

// Context: watchlist object after reshaping
{ id: "abc", name: "...", movies: [550, 278], ... }
```

This shape is what all components expect. When adding or removing a movie, both the database and the local `movies` array are updated together.

---

## Authentication Flow

```
User visits app
      |
      v
AuthProvider mounts, calls getSession()
      |
      |-- session exists --> setUser(session.user) --> loading = false --> render app
      |
      |-- no session -----> setUser(null) ----------> loading = false --> render app
                                                             |
                                                             v
                                                  ProtectedRoute redirects
                                                  to /login if user is null
```

On login:
```
Login.jsx calls signIn(email, password)
      |
      v
supabase.auth.signInWithPassword()
      |
      v
onAuthStateChange fires with new session
      |
      v
AuthContext sets user to session.user
      |
      v
MovieContext useEffect detects user change, calls fetchFavourites() and fetchWatchlists()
      |
      v
Data loads, components re-render with user's data
```

On logout:
```
NavBar calls signOut()
      |
      v
supabase.auth.signOut()
      |
      v
onAuthStateChange fires with null session
      |
      v
AuthContext sets user to null
      |
      v
MovieContext useEffect detects user is null, clears favourites and watchlists
      |
      v
ProtectedRoute redirects to /login
```

---

## Adding New Features

### Add a new page

1. Create `src/pages/NewPage.jsx`
2. Add the route in `App.jsx`
3. If login is required, wrap in `ProtectedRoute`
4. Add a link in `NavBar.jsx` if needed

```jsx
// App.jsx
import NewPage from './pages/NewPage'
<Route path="/new" element={<ProtectedRoute><NewPage/></ProtectedRoute>}/>
```

### Add a new piece of global state

1. Add the state variable and functions to `MovieContext.jsx`
2. Add the new values to the `value` object at the bottom of `MovieProvider`
3. If it needs a database table, create the table and RLS policies in Supabase first

### Add a new API call

1. Add a new async function to `src/services/api.js`
2. Import and call it wherever needed

```javascript
// api.js
export const getMovieCredits = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`)
    const data = await response.json()
    return data
}
```

### Add a new database table

1. Create the table in Supabase with the required columns
2. Enable RLS on the table
3. Write policies for select, insert, update, delete as needed
4. Add functions to `MovieContext.jsx` if the data needs to be globally available, or call Supabase directly from the component if the data is only needed in one place

### Add a reusable component

1. Create `src/components/NewComponent.jsx`
2. Always end with `export default NewComponent`
3. Add a corresponding CSS file in `src/css/` if it has styles
4. Import where needed

---

## Contributing

### Setting up for contribution

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a branch for your change: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a pull request on GitHub against the `main` branch

### Branch naming

```
feature/short-description    for new features
fix/short-description        for bug fixes
chore/short-description      for maintenance, dependency updates, etc.
```

### Before submitting a pull request

- Test your changes locally against a real Supabase project
- If you changed the database schema, include the SQL in your PR description
- Keep pull requests focused on one change. Do not bundle multiple unrelated fixes
- If you are fixing a bug, describe what caused it and how your fix addresses it

### How pull requests are reviewed

The maintainer reviews all pull requests before merging. Changes to `MovieContext.jsx`, `AuthContext.jsx`, or the database schema get extra scrutiny because they affect every part of the app. UI-only changes in individual components are lower risk.

If your pull request adds a new environment variable, document it in the README and in this file under Environment Variables.

---

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

| Variable | Where to get it | Used in |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard, Settings, API | `supabase.js` |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard, Settings, API | `supabase.js` |
| `VITE_API_KEY` | themoviedb.org, Settings, API | `api.js` |

The anon key is safe to expose in frontend code because Supabase RLS policies control what it can access. Do not use the Supabase service role key in this codebase.

---

## Known Issues and Limitations

**Movie posters in screenshots**

TMDB's image CDN does not send CORS headers, so html2canvas cannot read poster images directly. The current workaround routes images through `images.weserv.nl`, a third-party CORS proxy, before capturing. This requires an internet connection and depends on that service being available. If posters appear blank in downloaded images, the proxy may be unreachable.

**Watchlist limit**

Each user is limited to 10 watchlists. This is enforced in `createWatchlist` in `MovieContext.jsx` but not at the database level. A database-level check constraint could be added for stricter enforcement.

**Favourites store full objects in some older accounts**

Early versions of the app stored full movie objects in localStorage. After migrating to Supabase, favourites now store only TMDB IDs. Accounts created before the migration are not affected since Supabase is the source of truth.

**No pagination**

`getPopularMovies` and `searchMovies` return one page of results from TMDB. There is no infinite scroll or pagination implemented.

**Tags are stored as a PostgreSQL text array**

The `tags` column uses `text[]`. Updating tags requires rewriting the entire array (no append-only operation), which is what `addTag` and `removeTag` do via `updateWatchlist`. This is fine at current scale.

**Subtitle and dialogue search**

An earlier version of the app explored searching movie dialogue via OpenSubtitles and IMSDb scraping. This feature was not completed. The `scrape.py` file in the root is a standalone Python script unrelated to the React app.
