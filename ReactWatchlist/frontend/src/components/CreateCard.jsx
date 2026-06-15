
function CreateCard({ onClick }) {
    return <div className="watchlist-card create-card" onClick={onClick}>
        <span>+</span>
        <p>New Watchlist</p>
    </div>
}

export default CreateCard