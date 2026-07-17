
import "../css/MovieCard.css"
import { useState } from "react"
import { useMovieContext } from "../contexts/MovieContext"


function MovieCard({movie}){
    
    const { isFavourite, addToFavourites, removeFromFavourites, watchlists, addMovieToWatchlist } = useMovieContext()
    const [showWatchlistPicker, setShowWatchlistPicker] = useState(false)

    const favourite = isFavourite(movie.id)

    const onFavouriteClick = (e) => {
        e.preventDefault()
        if (favourite) removeFromFavourites(movie.id)
        else addToFavourites(movie)
    }


    return <div className="movie-card">
        <div className ="movie-poster">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} crossOrigin="anonymous"/>
            <div className="movie-overlay">
                <button className="favourite-btn" onClick={onFavouriteClick}>
                    {favourite ? "❤️" : "💔"}
                </button>
                <button
                    className="watchlist-btn"
                    onClick={e => { e.preventDefault(); setShowWatchlistPicker(p => !p) }}
                    // p => !p toggles the state of showWatchlistPicker (if true then make false and vice versa)
                >
                    +
                </button>
                {showWatchlistPicker && (
                    <div className="watchlist-picker" onClick={e => e.stopPropagation()}>
                        {watchlists.length === 0
                            ? <p className="picker-empty">No watchlists yet</p>
                            : watchlists.map(w => (
                                <button
                                    key={w.id}
                                    className="picker-item"
                                    onClick={() => {
                                        addMovieToWatchlist(w.id, movie)
                                        setShowWatchlistPicker(false)
                                    }}
                                >
                                    {w.name}
                                </button>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            {/*?.split("-")[0] just leaves year*/}
            <p>{movie.release_date?.split("-")[0]}</p>
        </div>
    </div>
}

export default MovieCard