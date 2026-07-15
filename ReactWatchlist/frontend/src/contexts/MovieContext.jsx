// Provide global state and helper functions. state manager.

import { createContext, useState, useContext,useEffect } from "react";

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext)


// Provide state to any of the components that are wrapped around it
export const MovieProvider = ({children}) => {    

    const [favourites, setFavourites] = useState(() => {
        const storedFavs = localStorage.getItem("favourites")
        return storedFavs ? JSON.parse(storedFavs) : []
    })

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
            name: `Watchlist ${watchlists.length + 1}`,
            description: "A new watchlist",
            movies: [],
            tags: []
        }

        setWatchlists(prev => [...prev, newWatchlist])
    }

    const updateWatchlist = (watchlistId, updatedData) => {
        // Update one field without overwriting the whole object
        setWatchlists(prev => prev.map(watchlist =>
            watchlist.id === watchlistId ? { ...watchlist, ...updatedData } : watchlist
        ))  
    }

    const deleteWatchlist = (watchlistId) => {
        setWatchlists(prev => prev.filter(watchlist => watchlist.id !== watchlistId))
    }

    const addMovieToWatchlist = (watchlistId, movie) => {
        setWatchlists(prev => prev.map(w =>
            w.id === watchlistId && !w.movies.includes(Number(movie.id))
                ? { ...w, movies: [...w.movies, Number(movie.id)] }
                : w
        ))
    }

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
        // Trim whitespace and check if the tag is not empty
        const trimmed = tag.trim()
        if (!trimmed) return

        // Check if the tag already exists in the watchlist, if it does, don't add it again
        // If it doesn't exist, add it to the watchlist's tags array
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

    // value={value} allows the children to access the values
    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
}