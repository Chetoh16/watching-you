import { useParams } from "react-router-dom"
import { useMovieContext } from "../contexts/MovieContext"
import { useState, useEffect } from "react"
import { getMovieById } from "../services/api"

function WatchlistDetail() {

    const { watchlistId } = useParams();
    const { watchlists } = useMovieContext()
    const [movies, setMovies] = useState([])

    const watchlist = watchlists.find(w => w.id === watchlistId)

    useEffect(() => {
        // Promise.all to fetch all movies by ID from TMDB
        if (!watchlist) return
        Promise.all(watchlist.movies.map(movieId => getMovieById(movieId)))
            .then(fetchedMovies => setMovies(fetchedMovies))
            .catch(error => console.error("Error fetching movies:", error));
    }, [watchlist])


    return (
        <div>
            <h1>Watchlist Detail</h1>
        </div>
    )
} 

export default WatchlistDetail