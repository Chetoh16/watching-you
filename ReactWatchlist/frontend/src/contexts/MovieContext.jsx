// Provide global state and helper functions. state manager.

import { createContext, useState, useContext,useEffect } from "react";

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext)


// Provide state to any of the components that are wrapped around it
export const MovieProvider = ({children}) => {
    const [favourites, setFavourites] = useState([])

    useEffect(() => {
        const storedFavs = localStorage.getItem("favourites")

        // store favs in array. store it as json as local storage can only store array
        // when reading in, convert json to real object 
        if (storedFavs) setFavourites(JSON.parse(storedFavs))
    }, [])

    // anytime "favourites" state changes, update local storage
    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites))
    },[favourites])

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

    // some() checks if at least one item in an array matches a condition.
    const isFavourite = (movieID) => {
        return favourites.some(movie => movie.id === movieID)
    }

    const value = {
        favourites,
        addToFavourites,
        removeFromFavourites,
        isFavourite
    }

    // value={value} allows the children to access the values
    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
}