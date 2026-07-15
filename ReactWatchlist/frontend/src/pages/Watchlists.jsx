import "../css/Watchlist.css"
import CreateCard from "../components/CreateCard"
import WatchlistCard from "../components/WatchlistCard"
import { useMovieContext } from "../contexts/MovieContext"


function Watchlists(){
    const { watchlists, createWatchlist } = useMovieContext()
    
    return <>
        {watchlists.length === 0 && (
            <div className="favourites-empty">
                <h2>No Watchlists Yet</h2>
                <p>Start adding watchlists.</p>
            </div>
        )}

        <div className="watchlist-grid">
            <CreateCard onClick={createWatchlist}/>
            {watchlists.map(w => <WatchlistCard key={w.id} watchlist={w} />)}
        </div>

    </>


}

export default Watchlists