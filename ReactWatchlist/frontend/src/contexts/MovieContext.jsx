// Provide global state and helper functions. state manager.

import { createContext, useState, useContext,useEffect } from "react";

// context object used to hold all shared state
// wrap the context.Provider around any component that will want to consume its values
// components don't use this but instead use the useMovieContext
const MovieContext = createContext()

// what components call to access the context
// rather than having to do extra steps to access it
export const useMovieContext = () => useContext(MovieContext)

// Provides state to any of the components that are wrapped around it
// any component inside that wrapper can call useMovieContext() to access the state and functions defined here
export const MovieProvider = ({children}) => {    

    // lazy initialisation
    // instead of useState([]), pass a function so React calls it once on first render to get initial value
    // reads from localStorage before first render, if nothing is stored there it defaults to an empty array
    const [favourites, setFavourites] = useState(() => {
        const storedFavs = localStorage.getItem("favourites")
        return storedFavs ? JSON.parse(storedFavs) : []
        // JSON.parse: localStorage only stores strings, so need to convert back to array
    })

    // same lazy initialisation
    const [watchlists, setWatchlists] = useState(() => {
        const stored = localStorage.getItem("watchlists")
        return stored ? JSON.parse(stored) : []
    })

    const createWatchlist = () => {
        if (watchlists.length >= 10) {
            console.error("Maximum number of watchlists reached.")
            return
        }

        const newWatchlist = {
            id: crypto.randomUUID(),
            // crypto.randomUUID() is built into browsers (no library needed) and generates a unique ID
            name: `Watchlist ${watchlists.length + 1}`,
            description: "A new watchlist",
            movies: [],
            tags: []
        }

        setWatchlists(prev => [...prev, newWatchlist])
    }

    const updateWatchlist = (watchlistId, updatedData) => {
        // update one field without overwriting the whole object

        // map() creates a new array. For each watchlist:
        //   - if it matches the ID: merge existing fields with new changes
        //   - { ...watchlist, ...changes } copies all existing fields, then overwrites
        //     only the ones present in `changes`
        //   - if it doesn't match: return it unchanged
        setWatchlists(prev => prev.map(watchlist =>
            watchlist.id === watchlistId ? { ...watchlist, ...updatedData } : watchlist
        ))  
    }

    // Removes the watchlist entirely by filtering it out by ID
    const deleteWatchlist = (watchlistId) => {
        setWatchlists(prev => prev.filter(watchlist => watchlist.id !== watchlistId))
    }

    // Adds a movie ID to a watchlist's movies array
    // Number(movie.id) ensures it's stored as a number, not a string
    // the !w.movies.includes() prevents duplicates
    const addMovieToWatchlist = (watchlistId, movie) => {
        setWatchlists(prev => prev.map(w =>
            w.id === watchlistId && !w.movies.includes(Number(movie.id))
                ? { ...w, movies: [...w.movies, Number(movie.id)] }
                : w
        ))
    }

    // Removes a movie ID from the watchlist's movies array.
    const removeMovieFromWatchlist = (watchlistId, movieId) => {
        setWatchlists(prev => prev.map(w =>
            w.id === watchlistId
                ? { ...w, movies: w.movies.filter(id => id !== Number(movieId)) }
                : w
        ))
    }



    // Anytime "favourites" state changes, update local storage
    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites))
    },[favourites])

    
    // Anytime "watchlists" state changes, update local storage
    useEffect(() => {
        localStorage.setItem('watchlists', JSON.stringify(watchlists))
    },[watchlists])

    // Can't just straight add to array by array.push bcs it wouldn't update the state
    // Take previous value (favourites array), add new movie
    // This is how you update state in array
    const addToFavourites = (movie) => {
        setFavourites(prev => [...prev, movie])
    }

    // Create a new array containing all favourites except the one with the given movieID
    const removeFromFavourites = (movieID) => {
        setFavourites(prev => prev.filter(movie => movie.id !== movieID))
    }

    // Some() checks if at least one item in an array matches a condition.
    const isFavourite = (movieID) => {
        return favourites.some(movie => movie.id === movieID)
    }

    const addTag = (watchlistId, tag) => {
        const trimmed = tag.trim()
        if (!trimmed) return

        setWatchlists(prev => prev.map(w =>
            w.id === watchlistId && !w.tags.includes(trimmed)
                ? { ...w, tags: [...w.tags, trimmed] }
                : w
        ))
    }

    const removeTag = (watchlistId, tag) => {
        setWatchlists(prev => prev.map(w =>
            w.id === watchlistId
                ? { ...w, tags: w.tags.filter(t => t !== tag) }
                : w
        ))
    }

    // everything in this object is accessible to any component that calls useMovieContext()
    const value = {
        favourites,
        addToFavourites,
        removeFromFavourites,
        isFavourite,
        watchlists,
        createWatchlist,
        updateWatchlist,
        deleteWatchlist,
        addMovieToWatchlist,
        removeMovieFromWatchlist,
        addTag,
        removeTag
    }

    // MovieContext.Provider is what makes the value available to all descendant components. 
    // {children} renders whatever is wrapped inside <MovieProvider>...</MovieProvider> in App.jsx.
    // value={value} allows the children to access the values
    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
}