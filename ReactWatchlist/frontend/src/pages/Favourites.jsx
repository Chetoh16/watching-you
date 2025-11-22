import "../css/Favourites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"

function Favourites(){
    const {favourites} = useMovieContext();

    if (favourites) {
        return (
        <div className="favourites">
                <h2> Your Favourites </h2>
                <div className="movies-grid">
                {favourites.map((movie) => (
                    (
                        <MovieCard movie={movie} key={movie.id} />
                    )
                ))}
            </div>
        </div>
        );
    }


    return <div className="favourites-empty">
        <h2> No Favourite Movies Yet</h2>
        <p> Start adding movies.</p>
    </div>
}

export default Favourites