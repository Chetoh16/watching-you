import MovieCard from "../components/MovieCard"

// called hook
import { useState, useEffect } from "react"
import { searchMovies, getPopularMovies } from "../services/api"
import "../css/Home.css"






function Home() {
    // define state and use it so it can persist 
    // convention: 1-name of state, 2-function to update state.
    // useState is default state
    const [searchQuery, setSearchQuery] = useState("");

    // store in state so it persists. so anytime we update movies list, it will automatically re-render components
    const [movies, setMovies] = useState([]);

    // Common practice when loading from an API : Set 2 variables/state
    // 1) Store the "loading state"
    // 2) Store any potential error
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {}, [])
    // () => {}, []
    // pass a function () => {} and a dependency array []. function gets called when array [] changes
    // after every re-render check dependency array, if it's changed since the last time rendered, run this () => {} useEffect
    // if there's nothing inside [], it will just run one time when it's rendered on screen
 
    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const popularMovies = await getPopularMovies()
                setMovies(popularMovies)
            } catch (err) {
                console.log(err)
                setError("Failed to load movies...")
            }
            finally {
                setLoading(false)
            }
        }
        loadPopularMovies()
    }, [])


    const handleSearch = async (e) => {
        e.preventDefault();  // to prevent default behaviour
        if (!searchQuery.trim()) return // won't allow empty searches
        if (loading) return // won't allow to search when already searching

        setLoading(true)
        try{
            const searchResults = await searchMovies(searchQuery)
            setMovies(searchResults)
            setError(null) // if we had error before, we're clearing it here
        } catch (err) {
            console.log(err)
            setError("Failed to search movies...")
        } finally{
            setLoading(false)
        }
        
        

        // setSearchQuery("")  // set state 
    };


    // .map function iterates over values inside the movies array (dynamic therefore need key)
    // for eacy value it passes them into the "movie =>" function which returns the MovieCard component
    // simply, it displays all the movies

    //onChange={(e) => setSearchQuery(e.target.value)} is how you update state from input element


    return <div className="home">
        {/* text input controlled by React state (searchQuery).
          every keystroke updates the state via setSearchQuery */}
        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                placeholder="Search for a movie..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
            <div className="loading">Loading...</div>
        ) : (
            <div className="movies-grid">
                {movies.map((movie) => (
                    // movie.title.toLowerCase().startsWith(searchQuery) && // simple way to do it
                    (
                        <MovieCard movie={movie} key={movie.id} />
                    )
                ))}
            </div>
        )}
    </div>
}

export default Home