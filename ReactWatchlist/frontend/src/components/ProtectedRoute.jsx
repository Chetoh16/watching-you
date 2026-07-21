import { useAuthContext  } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

// wraps any route that requires login.
// if no user, redirects to /login.
// if logged in, renders the page as normal.
function ProtectedRoute({ children }) {
    const { user } = useAuthContext()

    if (!user){
        return <Navigate to="/login" replace />
    } 
    return children
}

export default ProtectedRoute