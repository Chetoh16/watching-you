import { useState } from "react"
import { useMovieContext } from "../contexts/MovieContext"

function WatchlistCard({ watchlist }) {
    const { updateWatchlist, deleteWatchlist, addTag, removeTag } = useMovieContext()
    const {modalOpen, setModalOpen} = useState(false)
    const [newTag, setNewTag] = useState("")

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
        <div className="watchlist-card" onClick={() => setModalOpen(true)}>
            <div className="card-banner" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
                <div className="colour-picker-btn" style={{ backgroundColor: watchlist.colour || "#2a2a2a" }}>
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
                        <span key={tag} className="tag">{tag}
                            <button className="remove-tag-btn" onClick={e => { e.stopPropagation(); removeTag(watchlist.id, tag) }}>
                                ×
                            </button>
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
            {modalOpen && (
                <WatchlistModal
                    watchlist={watchlist}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
        
    )
}

export default WatchlistCard