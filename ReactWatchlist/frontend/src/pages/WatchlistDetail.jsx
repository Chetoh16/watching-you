import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMovieContext } from "../contexts/MovieContext"
import { getMovieById, searchMovies } from "../services/api"
import MovieCard from "../components/MovieCard"
import "../css/WatchlistDetail.css"

function WatchlistDetail() {
    const { watchlistId } = useParams()
    const navigate = useNavigate()
    const { watchlists, addMovieToWatchlist, removeMovieFromWatchlist } = useMovieContext()

    const [movies, setMovies] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [addedIds, setAddedIds] = useState(new Set())  // tracks recently added for feedback

    const searchRef = useRef(null)

    const watchlist = watchlists.find(w => w.id === watchlistId)

    useEffect(() => {
        if (!watchlist) navigate("/watchlists")
    }, [watchlist])

    useEffect(() => {
        if (!watchlist || watchlist.movies.length === 0) {
            setLoading(false)
            return
        }
        Promise.all(watchlist.movies.map(id => getMovieById(id)))
            .then(results => {
                setMovies(results.filter(Boolean))
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([])
                setSearchQuery("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        setSearching(true)
        try {
            const results = await searchMovies(searchQuery)
            setSearchResults(results)
        } catch (err) {
            console.error(err)
        } finally {
            setSearching(false)
        }
    }

    const dismissSearch = () => {
        setSearchResults([])
        setSearchQuery("")
    }

    const isInWatchlist = (movieId) => watchlist?.movies.includes(Number(movieId))

    const handleToggle = (movie) => {
        if (isInWatchlist(movie.id)) {
            removeMovieFromWatchlist(watchlistId, movie.id)
            setMovies(prev => prev.filter(m => m.id !== movie.id))
            setAddedIds(prev => { const n = new Set(prev); n.delete(movie.id); return n })
        } else {
            addMovieToWatchlist(watchlistId, movie)
            setMovies(prev => [...prev, movie])
            setAddedIds(prev => new Set(prev).add(movie.id))
            // clear the "added" indicator after 2 seconds
            setTimeout(() => {
                setAddedIds(prev => { const n = new Set(prev); n.delete(movie.id); return n })
            }, 2000)
        }
    }

    if (!watchlist) return null

    return (
        <div className="watchlist-detail">
            <div className="detail-header" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                <button className="back-btn" onClick={() => navigate("/watchlists")}>← Back</button>
                <div className="detail-header-text">
                    <h1>{watchlist.name}</h1>
                    <p>{watchlist.description}</p>
                    {watchlist.tags.length > 0 && (
                        <div className="tags">
                            {watchlist.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="detail-body">
                {/* Search */}
                <div ref={searchRef}>
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search to add movies..."
                            className="search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchResults.length > 0
                            ? <button type="button" className="search-btn dismiss-btn" onClick={dismissSearch}>✕</button>
                            : <button type="submit" className="search-btn">{searching ? "..." : "Search"}</button>
                        }
                    </form>

                    {searchResults.length > 0 && (
                        <section className="detail-section">
                            <h2>Results</h2>
                            <div className="movies-grid">
                                {searchResults.map(movie => (
                                    <div key={movie.id} className="detail-movie-item">
                                        <MovieCard movie={movie} />
                                        <button
                                            className={`watchlist-toggle-btn ${isInWatchlist(movie.id) ? "in-list" : ""} ${addedIds.has(movie.id) ? "just-added" : ""}`}
                                            onClick={() => handleToggle(movie)}
                                        >
                                            {addedIds.has(movie.id) ? "✓ Added" : isInWatchlist(movie.id) ? "Remove" : "+ Add"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Movies in watchlist */}
                <section className="detail-section">
                    <h2>In this watchlist ({watchlist.movies.length})</h2>
                    {loading ? (
                        <p className="detail-empty">Loading...</p>
                    ) : movies.length === 0 ? (
                        <p className="detail-empty">No movies yet. Search above to add some.</p>
                    ) : (
                        <div className="movies-grid">
                            {movies.map(movie => (
                                <div key={movie.id} className="detail-movie-item">
                                    <MovieCard movie={movie} />
                                    <button
                                        className="watchlist-toggle-btn in-list"
                                        onClick={() => handleToggle(movie)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default WatchlistDetail