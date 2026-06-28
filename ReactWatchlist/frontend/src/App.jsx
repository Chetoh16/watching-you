import './css/App.css'
import Favourites from './pages/Favourites'
import Home from './pages/Home'
import {Routes, Route} from "react-router-dom"
import NavBar from './components/NavBar'
import { MovieProvider } from './contexts/MovieContext'
import Watchlists from './pages/Watchlists'
import WatchlistDetail from './pages/WatchlistDetail'

function App() {


  return (
    <MovieProvider> 
      <NavBar/>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/favourites" element={<Favourites/>}/>
          <Route path="/watchlists" element={<Watchlists/>}/>
          <Route path="/watchlists/:watchlistId" element={<WatchlistDetail/>}/>
        </Routes> 
      </main>
    </MovieProvider>
  )
}

export default App
