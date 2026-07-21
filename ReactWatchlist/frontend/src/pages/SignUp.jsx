import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import '../css/Auth.css'

function SignUp(){

    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")
    const[loading, setLoading] = useState(false)
    const[error, setError] = useState(null)
    const[success, setSuccess] = useState(null)
    
    const signUp = useAuthContext()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try{
            const result = await signUp(email, password)
            navigate("/")
            // navigate to home on success
        }
        catch(err){
            setError(err.message)
        }
        finally{
            setLoading(false)
            // end loading state
        }
    }

    // by default Supabase has email confirmation enabled 
    // for now, it's disabled so that new users don't have to spend extra time
    //
    // if (success) return (
    //     <div className="auth-page">
    //         <div className="auth-card">
    //             <h1>Check your email</h1>
    //             <p>We sent a confirmation link to {email}. Click it to activate your account.</p>
    //             <Link to="/login" className="search-btn" style={{display:'block', textAlign:'center', marginTop:'1rem'}}>
    //                 Back to Login
    //             </Link>
    //         </div>
    //     </div>
    // )

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                {error && <p className="auth-error">{error.message || error}</p>}
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
                        placeholder="Password (min 6 characters)"
                        className="search-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    )
}

export default SignUp