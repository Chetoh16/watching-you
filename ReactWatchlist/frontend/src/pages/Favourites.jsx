import { useState, useEffect } from 'react'
import { useMovieContext } from '../contexts/MovieContext'
import { getMovieById } from '../services/api'
import MovieCard from '../components/MovieCard'
import '../css/Favourites.css'

function Favourites(){
    // extract array of favorited movie IDs from global context (e.g., [550, 278])
    const {favourites} = useMovieContext();

    // holds array of full movie objects fetched from TMDB
    const [movies, setMovies] = useState([])

    const [loading, setLoading] = useState(true)

    // Fetch full movie details whenever the favourites list changes
    useEffect(() => {

        // if user has no favourites, reset movies state and stop loading
        if (favourites.length === 0) {
            setMovies([])
            setLoading(false)
            return
        }

        // fetch details for all favorited IDs in parallel
        Promise.all(favourites.map(id => getMovieById(id)))
            .then(results => {
                // filter out any null/failed requests, then save to state
                setMovies(results.filter(Boolean))
                setLoading(false)
            })
    }, [favourites])

    // render while loading
    if (loading) return <div className="favourites-empty"><p>Loading...</p></div>

    // render empty state if user has no favorited movies
    if (movies.length === 0) return (
        <div className="favourites-empty">
            <h2> No Favourite Movies Yet</h2>
            <p> Start adding movies.</p>
        </div>
    )

    // render grid of cards
    return (
        <div className="favourites">
            <h2>Your Favourites</h2>
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard movie={movie} key={movie.id} />
                ))}
            </div>
        </div>
    )
}

export default Favourites