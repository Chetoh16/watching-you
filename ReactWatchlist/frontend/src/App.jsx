import './css/App.css'
import Favourites from './pages/Favourites'
import Home from './pages/Home'
import {Routes, Route} from "react-router-dom"
import NavBar from './components/NavBar'
import { MovieProvider } from './contexts/MovieContext'
import Watchlists from './pages/Watchlists'
import WatchlistDetail from './pages/WatchlistDetail'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {


  return (
    // AuthProvider is outside MovieProvider because MovieContext
    // needs to know who's logged in to fetch the right data
    <AuthProvider>
        <MovieProvider>
            <NavBar/>
            <main className="main-content">
                <Routes>
                    {/* Public routes which anyone can access */}
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/" element={<Home/>}/>

                    {/* Protected routes which must be logged in to access */}
                    <Route path="/favourites" element={
                        <ProtectedRoute><Favourites/></ProtectedRoute>
                    }/>
                    <Route path="/watchlists" element={
                        <ProtectedRoute><Watchlists/></ProtectedRoute>
                    }/>
                    <Route path="/watchlists/:watchlistId" element={
                        <ProtectedRoute><WatchlistDetail/></ProtectedRoute>
                    }/>
                </Routes>
            </main>
        </MovieProvider>
    </AuthProvider>
  )
}

export default App
