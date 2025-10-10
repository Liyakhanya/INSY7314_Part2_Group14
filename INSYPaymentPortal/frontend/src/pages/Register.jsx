import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await register(username, password);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: "linear-gradient(135deg, #00d5ff, #0095ff, #5d00ff)",
            backgroundSize: "400% 400%",
            animation: "gradientAnimation 15s ease infinite",
        }}>
            <style>
                {`
                    @keyframes gradientAnimation {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>

            <div className="bg-white p-5 rounded-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className='mb-4 text-primary text-center'>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                        <label className="form-label"><strong>Username</strong></label>
                        <input 
                            type="text"
                            placeholder="Enter Username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4 text-start">
                        <label className="form-label"><strong>Password</strong></label>
                        <input 
                            type="password"
                            placeholder="Enter Password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
                </form>

                <p className='mb-3 text-center'>Already have an account?</p>
                <Link to='/login' className="btn btn-outline-primary w-100">Login</Link>
            </div>
        </div>
    );
};

export default Register;
