import { Link } from "react-router-dom"
import "../css/NavBar.css"
import { useAuthContext } from "../contexts/AuthContext"

function NavBar(){

    const { user, signOut } = useAuthContext()


    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/"> WatchingYou </Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            {user && <>
                <Link to="/favourites" className="nav-link">Favourites</Link>
                <Link to="/watchlists" className="nav-link">Watchlists</Link>
                <button className="nav-link signout-btn" onClick={signOut}>Sign Out</button>
            </>}
            {!user && <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/signup" className="nav-link">Sign Up</Link>
            </>}
        </div>
    </nav>
}

export default NavBar