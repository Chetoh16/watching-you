import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMovieContext } from "../contexts/MovieContext"

function WatchlistCard({ watchlist }) {
    const { updateWatchlist, deleteWatchlist, addTag, removeTag } = useMovieContext()
    const [newTag, setNewTag] = useState("")

    // for navigation to the watchlist detail page when the card is clicked
    const navigate = useNavigate()

    const handleColourChange = (e) => {
        e.stopPropagation()
        updateWatchlist(watchlist.id, { colour: e.target.value })
    }

    const handleTagKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag(watchlist.id, newTag)
            setNewTag("")
        }
    }

    return (
        <div className="watchlist-card" onClick={() => navigate(`/watchlists/${watchlist.id}`)}>
            <div className="card-banner" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                <div className="colour-picker-btn" onClick={e => e.stopPropagation()} style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                    <input
                        type="color"
                        value={watchlist.colour || "#2a2a2a"}
                        onChange={handleColourChange}
                    />
                </div>
            </div>

            <div className="delete-btn" onClick={e => { e.stopPropagation(); deleteWatchlist(watchlist.id) }}>
                <span>×</span>
            </div>

            <div className="card-body" onClick={e => e.stopPropagation()}>
                <input
                    className="card-name"
                    value={watchlist.name}
                    onChange={e => updateWatchlist(watchlist.id, { name: e.target.value })}
                />
                <textarea
                    className="card-desc"
                    rows={2}
                    value={watchlist.description}
                    onChange={e => updateWatchlist(watchlist.id, { description: e.target.value })}
                />
                <div className="tags">
                    {watchlist.tags.map(tag => (
                        <span key={tag} className="tag">
                            {tag}
                            <span className="tag-remove" onClick={() => removeTag(watchlist.id, tag)}>×</span>
                        </span>
                    ))}
                    <input 
                        className="tag-input"
                        placeholder="+ tag"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                    />
                </div>
            </div>
        </div>
        
    )
}

export default WatchlistCard