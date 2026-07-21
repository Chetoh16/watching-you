import { useState, useEffect } from 'react'
import { useMovieContext } from '../contexts/MovieContext'
import { getMovieById } from '../services/api'
import MovieCard from '../components/MovieCard'
import '../css/Favourites.css'

function Favourites(){
    const {favourites} = useMovieContext();
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (favourites.length === 0) {
            setMovies([])
            setLoading(false)
            return
        }
        Promise.all(favourites.map(id => getMovieById(id)))
            .then(results => {
                setMovies(results.filter(Boolean))
                setLoading(false)
            })
    }, [favourites])

    if (loading) return <div className="favourites-empty"><p>Loading...</p></div>

    if (movies.length === 0) return (
        <div className="favourites-empty">
            <h2> No Favourite Movies Yet</h2>
            <p> Start adding movies.</p>
        </div>
    )

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