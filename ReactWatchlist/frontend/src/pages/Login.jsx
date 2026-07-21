import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import '../css/Auth.css'

function Login(){

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const {signIn} = useAuthContext()
    const navigate = useNavigate

    const handleSubmit = async (e) => {
        // prevents the browser's default behavior of reloading the entire web page on form submission.
        e.preventDefault()

        // clears out any previous error messages on screen and sets loading to true.
        setError(null)
        setLoading(true)

        try {
            // call sign in context function
            const result = await signIn(email, password) 

            // navigate to home on success
            navigate("/")

        } catch (err) {
            setError(err.message) 
        } finally {
            // end loading state
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Sign In</h1>
                {error && <p className="auth-error">{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        className="search-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="search-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    )


}

export default Login