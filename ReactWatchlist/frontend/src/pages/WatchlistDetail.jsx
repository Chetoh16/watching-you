import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
// useParams reads from the URL (the :watchlistId part)

import html2canvas from 'html2canvas';

import { useMovieContext } from "../contexts/MovieContext"
import { getMovieById, searchMovies } from "../services/api"
import MovieCard from "../components/MovieCard"
import "../css/WatchlistDetail.css"


function WatchlistDetail() {

    // watchlistId comes from the URL
    // now it can be used as a string
    const { watchlistId } = useParams()

    // navigate() allows URL to be changed
    // navigate("/watchlists") acts like clicking a link to /watchlists.
    const navigate = useNavigate()

    // get everything needed from the global context
    const { watchlists, addMovieToWatchlist, removeMovieFromWatchlist } = useMovieContext()

    // full movie objects fetched from TMDB (NOT stored in context as context only has IDs)
    const [movies, setMovies] = useState([])

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    // a Set of movie IDs that were recently added
    // set is used instead of array because Set.has() is O(1) lookup
    const [addedIds, setAddedIds] = useState(new Set())  

    // useRef creates a reference to a DOM element without causing re-renders
    // attach this to the search container div to detect clicks outside it
    const searchRef = useRef(null)

    // SCREENSHOT TAKING
    const snapshotRef = useRef(null)

    const handleCapture = async () => {
        if (!snapshotRef.current) return

        try {
            const images = snapshotRef.current.querySelectorAll('img')

            // Convert every image to base64 before html2canvas runs
            await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve) => {
                    const convert = (src) => {
                        fetch(src)
                            .then(res => res.blob())
                            .then(blob => {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                    img.src = reader.result
                                    resolve()
                                }
                                reader.readAsDataURL(blob)
                            })
                            .catch(resolve)
                    }

                    if (img.complete && img.naturalWidth > 0) {
                        convert(img.src)
                    } else {
                        img.onload = () => convert(img.src)
                        img.onerror = resolve
                    }
                })
            }))

            // Small delay to let DOM update with new base64 srcs
            await new Promise(r => setTimeout(r, 100))

            const canvas = await html2canvas(snapshotRef.current, {
                backgroundColor: "#1a1a1a",
                scale: 2,
                logging: false,
                useCORS: false,
                allowTaint: true
            })

            const link = document.createElement('a')
            link.download = `${watchlist.name}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

        } catch (err) {
            console.error("Screenshot failed:", err)
        }
    }
    



    // find the watchlist that matches the ID in the URL
    const watchlist = watchlists.find(w => w.id === watchlistId)

    // if the watchlist is deleted (or the ID is invalid), redirect back
    // runs whenever watchlist changes
    useEffect(() => {
        if (!watchlist) navigate("/watchlists")
    }, [watchlist])

    // fetch all movies in this watchlist from TMDB
    // Promise.all fires all API requests simultaneously
    useEffect(() => {
        if (!watchlist || watchlist.movies.length === 0) {
            setLoading(false)
            return
        }

        // watchlist.movies is an array of IDs like [550, 278, 680]
        // .map(id => getMovieById(id)) turns that into an array of Promises
        // Promise.all waits for ALL of them to resolve, then gives an array of results
        Promise.all(watchlist.movies.map(id => getMovieById(id)))
            .then(results => {
                setMovies(results.filter(Boolean))
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [watchlist])

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

        
        if (!searchQuery.trim()){
            return
        } 
        // ignore empty searches

        setSearching(true)
        try {
            const results = await searchMovies(searchQuery)
            setSearchResults(results)
        } catch (err) {
            console.error(err)
        } finally {
            setSearching(false)
            // finally always runs, even if there was an error

        }
    }

    // Clears the search results and input
    const dismissSearch = () => {
        setSearchResults([])
        setSearchQuery("")
    }

    // Checks if a movie ID is already in this watchlist
    // The ?. optional chaining means "if watchlist is undefined, return undefined instead of throwing an error".
    const isInWatchlist = (movieId) => watchlist?.movies.includes(Number(movieId))

    // Handles both adding and removing a movie, depending on current state.
    const handleToggle = (movie) => {
        if (isInWatchlist(movie.id)) {

            removeMovieFromWatchlist(watchlistId, movie.id)
            // remove from context (updates localStorage)

            setMovies(prev => prev.filter(m => m.id !== movie.id))
            // remove from local movies state (updates what's visible on screen)

            setAddedIds(prev => { const n = new Set(prev); n.delete(movie.id); return n })
        } else {

            addMovieToWatchlist(watchlistId, movie)
            // add to context (stores the ID in localStorage)

            setMovies(prev => [...prev, movie])
            // add full movie object to local state (so it shows in the list immediately)

            setAddedIds(prev => new Set(prev).add(movie.id))
            // clear the "added" indicator after 2 seconds
            setTimeout(() => {
                setAddedIds(prev => { const n = new Set(prev); n.delete(movie.id); return n })
            }, 2000)
        }
    }

    // early return
    if (!watchlist) return null

    return (
        <div className="watchlist-detail">
            <div ref={snapshotRef}>
                {/* Header uses the watchlist's custom colour as background */}
                <div className="detail-header" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                    <button className="back-btn" onClick={() => navigate("/watchlists")}>← Back</button>
                    <div className="detail-header-text">
                        <h1>{watchlist.name}</h1>
                        <p>{watchlist.description}</p>

                        {/* Only render the tags section if there are tags */}
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

                    {/* Search section, ref attached so click-outside detection works */}
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
                        
                        {/* Only show results section if there are results */}
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
            <button onClick={handleCapture}> 
                Download as Image
            </button>
        </div>
    )
}

export default WatchlistDetail