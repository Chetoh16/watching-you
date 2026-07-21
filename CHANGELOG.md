## V2.1.0 - Supabase Integration (2026-07-21)
### Added 
- Sign Up and Sign In Page

### Removed
- Local storage for storing favourited movies as well as watchlists

### Changed
- Replaced localStorage with 4 Supabase tables
    - `profiles` - user data (id, email) - NO password stored here
    - `favourites` - favourited movies - movies saved as IDs
    - `watchlists` - user's watchlists
    - `watchlist_movies` - movies inside watchlists
- Can only search up movies without logging in.
- When logged in, the user can:
    - Create & edit a watchlist
    - Favourite movies


## V2.0.0 - Watchlist Component (2026-07-17)
### Added 
- A watchlists page.
- Button to create a new watchlist.
- Customise the watchlist (i.e. add name, description, tags and banner colour).
- Add movies to the watchlists from the main search page.
- Search for movies inside the watchlists to add them quickly.
- Remove movies from the watchlists.
- Export the watchlist as a png.

## V1.0.1 - (2025-11-27)
### Added 
- Dynamic pages
- `_redirects` so that dynamic pages work correctly. When navigate directly to the page, it will navigate to index.htlm first.

### Fixed (2025-11-27)
- The `Create Watchlist` button now calls the associated function without any issues

### Added (2025-11-25)
- A branch called `watchlist-compon ent`


## V1.0.0 - 2025-11-22
- Initial watchlist done