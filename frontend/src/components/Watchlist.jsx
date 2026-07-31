import { Link } from "react-router-dom"


function Watchlist(watchlist){
    
    return <div className="watchlist-folder">
        <Link to={`/watchlist/${watchlist.id}`}>{props.name}</Link>
    </div>

}

export default Watchlist