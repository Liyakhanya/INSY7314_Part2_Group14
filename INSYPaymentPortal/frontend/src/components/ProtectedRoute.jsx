// allow us to send the user to different pages
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({children}) {
    // Check if user is authenticated by looking for token in localStorage
    const isAuthenticated = !!localStorage.getItem('bankingToken');
    
    // if the user is not authenticated...
    if (!isAuthenticated) {
        // navigate them back TO the login page, and REPLACE the current request with this.
        return <Navigate to="/login" replace />
    }

    // otherwise, let them have access to the page they want to go to!
    return children;
}