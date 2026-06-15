
function WatchlistCard({ watchlist}) {
    return <div className="watchlist-card">
        <div className="card-colour" style={{ backgroundColor: watchlist.colour }} />
        <h3>{watchlist.name}</h3>
        <p>{watchlist.description}</p>
    </div>
}