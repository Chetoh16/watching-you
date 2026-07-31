import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

// same hook pattern as MovieContext
export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    // null = not logged in, object = logged in user

    const [loading, setLoading] = useState(true)
    // true while checking if there's an existing session
    // show nothing until this is false to avoid flicker

    useEffect(function () {

        // check for an existing session on initial load
        supabase.auth.getSession().then(function (response) {
            const session = response.data.session

            if (session !== null && session !== undefined) {
                setUser(session.user)
            } else {
                setUser(null)
            }

            setLoading(false)
        })

        // set up a listener for auth changes (login, logout, etc.)
        const listenerResponse = supabase.auth.onAuthStateChange(
            function (event, session) {
                if (session !== null && session !== undefined) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
            }
        )

        const subscription = listenerResponse.data.subscription

        // cleanup: unsubscribe when component unmounts
        return () => subscription.unsubscribe()

        // same as:
        // return function cleanup() {
        //  subscription.unsubscribe()
        // }
    }, [])

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error){
            throw error  
            // let the calling component handle the error message
        } 
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error){
            throw error
        } 
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error){
            throw error
        } 
    }

    // the value object passed down to all children components
    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut
    }

    // don't render children until the initial loading check finishes.
    // without this, components would briefly render as logged-out
    // even when there's a valid session which would cause a flicker or wrong redirect.
    if (loading) return null

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}