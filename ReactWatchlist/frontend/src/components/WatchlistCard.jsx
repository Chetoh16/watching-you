import { useState } from "react"
import { useMovieContext } from "../contexts/MovieContext"

function WatchlistCard({ watchlist }) {
    const { updateWatchlist } = useMovieContext()

    const handleColourChange = (e) => {
        e.stopPropagation()
        updateWatchlist(watchlist.id, { colour: e.target.value })
    }

    return (
        <div className="watchlist-card">
            <div className="card-banner" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                <div className="colour-picker-btn" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                    <input
                        type="color"
                        value={watchlist.colour || "#2a2a2a"}
                        onChange={handleColourChange}
                    />
                </div>
            </div>

            <div className="card-body">
                <input
                    className="card-name"
                    value={watchlist.name}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateWatchlist(watchlist.id, { name: e.target.value })}
                />
                <textarea
                    className="card-desc"
                    rows={2}
                    value={watchlist.description}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateWatchlist(watchlist.id, { description: e.target.value })}
                />
                <div className="tags">
                    {watchlist.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WatchlistCard