import Watchlist from "../components/Watchlist"
import "../css/Watchlist.css"
import CreateCard from "../components/CreateCard"
import WatchlistCard from "../components/WatchlistCard"

import { useParams } from "react-router-dom";

function Watchlists(){
    
    const { watchlistId } = useParams();
    
    function createWatchlist(){
        return alert('hi');


    }
    
    
    return <>
        <div className="favourites-empty">
            <h2> No Watchlists Yet</h2>
            <p> Start adding watchlists.</p>
        </div>

        <div className="watchlist-grid">
            <CreateCard onClick={createWatchlist} />
            {watchlists.map(w => <WatchlistCard key={w.id} watchlist={w} />)}
        </div>

    </>


}

export default Watchlists