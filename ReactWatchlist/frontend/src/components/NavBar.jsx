import { Link } from "react-router-dom"
import "../css/NavBar.css"

function NavBar(){
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/"> WatchingYou </Link>
        </div>
        <div className="navbar-links"> 
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/favourites" className="nav-link">Favourites</Link>
            <Link to="/watchlists" className="nav-link">Watchlists</Link>
        </div>
    </nav>
}

export default NavBar