import { useParams } from "react-router-dom"
import { useMovieContext } from "../contexts/MovieContext"
import { useState, useEffect } from "react"
import { getMovieById } from "../services/api"

function WatchlistDetail() {

    const { watchlistId } = useParams();
    const { watchlists } = useMovieContext()
    const [movies, setMovies] = useState([])

    const watchlist = watchlists.find(w => w.id === watchlistId)

} 

export default WatchlistDetail