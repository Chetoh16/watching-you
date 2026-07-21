// Provide global state and helper functions. state manager.

import { createContext, useState, useContext,useEffect } from "react";
import { supabase } from '../services/supabase'
import { useAuthContext } from './AuthContext'

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
    
    const {user} = useAuthContext()
    const [favourites, setFavourites] = useState([])
    const [watchlists, setWatchlists] = useState([])

    // Fetch user's data whenever they log in or out
    useEffect(() => {
        if (!user) {
            // user logged out so clear everything
            setFavourites([])
            setWatchlists([])
            return
        }
        fetchFavourites()
        fetchWatchlists()
    }, [user])  // re-runs whenever user changes

    // FAVOURITES

    // Gets all favourited movie IDs for the logged-in user when the page loads
    // Finds all rows in the favourites table where user_id matches the current user,
    // returning only the movie_id column.
    const fetchFavourites = async () => {
        const {data, error} = await supabase
            .from('favourites')
            .select('movie_id')
            .eq('user_id', user.id)
        if (!error){
            setFavourites(data.map(row => row.movie_id))
            // store as flat array of IDs like [550, 278, 680]
        }
    }

    // Inserts a row into the database linking user.id to movie.id
    const addToFavourites = async(movie) => {
        const{error} = await supabase
        // don't need to do {error, data} bcs it won't be needed to send back the data
            .from('favourites')
            .insert(({user_id: user.id, movie_id: movie.id})
        )
        if (!error){
            setFavourites(prev => [...prev, movie.id])
            // updates to append the new ID to the existing array without re-fetching from the database
        } 
    }

    // Deletes the database row where both user_id and movie_id match
    // Create a new array containing all favourites except the one with the given movieID
    const removeFromFavourites = async (movieId) => {
        const{error} = await supabase
            .from('favourites')
            .delete()
            .eq('user_id', user.id)
            .eq('movie_id', movieId)
        if (!error){
            setFavourites(prev => prev.filter(id => id !== movieId))
        }
    }

    // checks whether a movie is already favorited
    const isFavourite = (movieId) => favourites.includes(Number(movieId))


    // WATCHLISTS

    const fetchWatchlists = async () => {

        // fetch watchlists and their movie IDs in one query using a join
        const {data, error} = await supabase
            .from('watchlists')
            .select(`id, name, description, colour, tags, created_at, watchlist_movies (movie_id)`)
            .eq('user_id', user.id)
            .order('created_at', {ascending: true})
        
        if (!error){
            // reshape data so movies is a flat array of IDs
            setWatchlists(data.map(w => ({
                ...w,
                movies: w.watchlist_movies.map(m => m.movie_id)
            })))
        }
    }

    const createWatchlist = async () => {
        if (watchlists.length >= 10) {
            console.error("Maximum number of watchlists reached.")
            return
        }

        const newWatchlist = {
            user_id: user.id,
            name: `Watchlist ${watchlists.length + 1}`,
            description: "A new watchlist",
            colour: '#2a2a2a',
            tags: []
        }

        const{data, error} = await supabase
            .from('watchlists')
            .insert(newWatchlist)
            .select()
            .single()
            // returns the created row, not an array

        if (!error){
            setWatchlists(prev => [...prev, { ...data, movies: [] }])
        }

    }

    // Accepts a changes object (e.g., { name: "Action Movies" }) 
    // and applies only those specific column updates to both the database and React state.
    const updateWatchlist = async(id, changes) => {
        const{error} = await supabase
            .from('watchlists')
            .update(changes)
            .eq('id', id)
        
        if (!error) {
            // update one field without overwriting the whole object

            // map() creates a new array. For each watchlist:
            //   - if it matches the ID: merge existing fields with new changes
            //   - { ...watchlist, ...changes } copies all existing fields, then overwrites
            //     only the ones present in `changes`
            //   - if it doesn't match: return it unchanged
            setWatchlists(prev =>
                prev.map(watchlist => watchlist.id === id ? { ...watchlist, ...changes } : watchlist)
            )
        }
    }

    // Removes the watchlist entirely by filtering it out by ID
    // Deleting a watchlist automatically removes all linked entries in watchlist_movies on the database level.
    const deleteWatchlist = async(id) =>{
        const {error} = await supabase
            .from('watchlists')
            .delete()
            .eq('id', id)

        // watchlist_movies rows are deleted automatically via CASCADE
        if (!error){
            setWatchlists(prev => prev.filter(w => w.id !== id))
        }
    }

    // Adds a movie ID to a watchlist's movies array
    // Number(movie.id) ensures it's stored as a number, not a string
    const addMovieToWatchlist = async(watchlistId, movie) => {
        const {error} = await supabase
            .from('watchlist_movies')
            .insert({watchlist_id: watchlistId, movie_id:Number(movie.id)})

        if (!error){
            setWatchlists(prev => prev.map(w =>
                w.id === watchlistId
                    ? { ...w, movies: [...w.movies, Number(movie.id)] }
                    : w
            ))
        }

    }

    // Removes a movie ID from the watchlist's movies array.
    const removeMovieFromWatchlist = async (watchlistId, movieId) => {
        const {error} = await supabase
            .from('watchlist_movies')
            .delete()
            .eq('watchlist_id', watchlistId)
            .eq('movie_id', Number(movieId))

        if(!error){    
            setWatchlists(prev => prev.map(w =>
                w.id === watchlistId
                    ? { ...w, movies: w.movies.filter(id => id !== Number(movieId)) }
                    : w
            ))
        }

    }

    // TAGS

    const addTag = async (watchlistId, tag) => {

        // removes leading and trailing whitespace
        const trimmed = tag.trim()

        // don't allow empty strings
        if (!trimmed) return
        
        // find the right watchlist
        const watchlist = watchlists.find(w => w.id === watchlistId)

        // don't allow duplicates
        if (!watchlist || watchlist.tags.includes(trimmed)){
            return
        }

        // create a new array containing all existing tags from watchlist.tags,
        // plus the new trimmed tag appended to the end.
        const newTags = [...watchlist.tags, trimmed]

        // call updateWatchlist function,
        // passing the target watchlistId and an object specifying the column update: { tags: newTags }.
        await updateWatchlist(watchlistId, {tags: newTags})

    }

    const removeTag = async (watchlistId, tag) => {
        
        // find right watchlist
        const watchlist = watchlists.find(w => w.id === watchlistId)

        // return if it doesn't exist
        if (!watchlist){
            return
        }

        // create a new array containing every tag except the one that matches tag
        const newTags = watchlist.tags.filter(t => t !== tag)

        await updateWatchlist(watchlistId, {tags: newTags})


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