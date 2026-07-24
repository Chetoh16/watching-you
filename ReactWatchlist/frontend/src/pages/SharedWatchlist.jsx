import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { getMovieById } from '../services/api'
import MovieCard from '../components/MovieCard'
import '../css/WatchlistDetail.css'

function SharedWatchlist() {

    // get token for sharing watchlist
    const { shareToken } = useParams()

    // get user data
    const { user } = useAuthContext()

    const [watchlist, setWatchlist] = useState(null)
    const [movies, setMovies] = useState([])

    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // tracks duplicate watchlist creation state
    const [copying, setCopying] = useState(false)
    // controls success UI feedback after copying
    const [copied, setCopied] = useState(false)

    // trigger data fetching whenever the token changes
    useEffect(() => {
        fetchSharedWatchlist()
    }, [shareToken])

    /**
     * Fetches the shared watchlist record along with its movie IDs,
     * then fill the detailed movie details from the external API.
     */
    const fetchSharedWatchlist = async () => {

        // get a single watchlist (with matching share token) from Supabase,
        // including related rows from the 'watchlist_movies' join table
        const { data, error } = await supabase
            .from('watchlists')
            .select('*, watchlist_movies(movie_id)')
            .eq('share_token', shareToken)
            .single()

        if (error || !data) {
            setNotFound(true)
            setLoading(false)
            return
        }

        // store fetched watchlist details in state
        setWatchlist(data)

        // extract movie IDs array and fetch full movie data 
        const movieIds = data.watchlist_movies.map(m => m.movie_id)
        if (movieIds.length > 0) {
            const movieData = await Promise.all(movieIds.map(id => getMovieById(id)))

            // if API response returns null or undefinted, filter it out
            setMovies(movieData.filter(Boolean))
        }

        // loading done
        setLoading(false)
    }

    /**
     * Clones the shared watchlist and its movie relations 
     * directly into the user's account (has to be logged in).
     */
    const handleCopy = async () => {

        // user has to be authenticated
        if (!user) return
        setCopying(true)

        try {
            // create the new watchlist
            const { data, error } = await supabase
                .from('watchlists')
                .insert({
                    user_id: user.id,
                    name: `${watchlist.name} (copy)`,
                    description: watchlist.description,
                    colour: watchlist.colour,
                    tags: watchlist.tags,
                    // copy is private by default
                    share_token: null  
                })
                .select()
                .single()

            if (error) throw error

            // copy all the movies across
            const movieRows = watchlist.watchlist_movies.map(m => ({
                watchlist_id: data.id,
                movie_id: m.movie_id
            }))

            // insert copied movies
            if (movieRows.length > 0) {
                const { error: movieError } = await supabase
                    .from('watchlist_movies')
                    .insert(movieRows)
                if (movieError) throw movieError
            }

            setCopied(true)
        } catch (err) {
            console.error("Failed to copy your beautiful watchlist:", err)
        } finally {
            setCopying(false)
        }
    }

    // render loading message while fetching data
    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading...</p>
        </div>
    )

    // render 'Not Found' error message when token is invalid or database returns an error
    if (notFound) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Watchlist not found</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                This link may be invalid or sharing may have been turned off. Ask again for a new link (don't be shy).
            </p>
            <Link to="/" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                Go home
            </Link>
        </div>
    )

    // render main view when watchlist and movie data are successfully loaded
    return (
        <div className="watchlist-detail">
            <div className="detail-header" style={{ backgroundColor: watchlist.colour || '#2a2a2a' }}>
                <div className="detail-header-text">
                    <h1>{watchlist.name}</h1>
                    <p>{watchlist.description}</p>
                    {watchlist.tags?.length > 0 && (
                        <div className="tags">
                            {watchlist.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="detail-body">

                {/* Logged in so show copy button */}
                {user && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        {copied ? (
                            <p style={{ color: 'rgba(100,220,130,0.95)' }}>
                                ✓ Copied to your watchlists
                            </p>
                        ) : (
                            <button
                                className="search-btn"
                                onClick={handleCopy}
                                disabled={copying}
                            >
                                {copying ? 'Copying...' : '+ Copy to my watchlists'}
                            </button>
                        )}
                    </div>
                )}

                {/* Not logged in so nudge to sign in */}
                {!user && (
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        <Link to="/login">Sign in</Link> to copy this watchlist to your account.
                    </p>
                )}

                <section className="detail-section">
                    <h2>{movies.length} movies</h2>
                    {movies.length === 0 ? (
                        <p className="detail-empty">This watchlist has no movies.</p>
                    ) : (
                        <div className="movies-grid">
                            {movies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default SharedWatchlist