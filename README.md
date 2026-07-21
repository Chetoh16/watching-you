# WatchingYou
A React + Vite application for browsing, favouriting and managing your own movie watchlists, integrating with the TMDB API and Supabase.

![Home-Screen](./ReactWatchlist/frontend/src/assets/home-screen.png)

![Favourites-Screen](./ReactWatchlist/frontend/src/assets/favoruites-screen.png)

![Watchlists-Screen](./ReactWatchlist/frontend/src/assets/watchlists-screen.png)

![Watchlist-Page-Screen](./ReactWatchlist/frontend/src/assets/watchlist-page-screen.png)

## Overview
The application is deployed on Netlify. Go and make your first watchlist now (if you want to)!
[Link to the Website](https://watching-you-watchlist.netlify.app)


## How It's Made:
- Technologies Used: `HTML, CSS, React, Vite, JavaScript, TMDB API, Supabase, Netlify`

The application retrieves movie data from the TMDB API and displays popular movies on the Home page. React state is used to manage dynamic data such as the movie list, search results, and loading status. The favourited movies along with the watchlists are fetched from the Supabase backend.


## Installation Guide  

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
### 4. Run the app
```bash
npm run dev
```


## Future Enhancements
- Implement a backend to securely handle API requests
- Ability to add personal notes for each movie
- Rate movies
- Darkmode and Lightmode


- A big thanks to `Tech With Tim`.