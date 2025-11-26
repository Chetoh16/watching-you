import Watchlist from "../components/Watchlist"
import "../css/Watchlist.css"


function Watchlists(i){
    
    //function CreateWatchlist
    
    return <>
        <div className="favourites-empty">
            <h2> No Watchlists Yet</h2>
            <p> Start adding watchlists.</p>
        </div>
        <div className="create-watchlist">
            <button type="submit" className="search-btn" onclick="CreateWatchlist();" >Create Watchlist </button>
        </div>
    </>


}

export default Watchlists