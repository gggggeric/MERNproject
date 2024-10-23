// src/components/Login.js
import { jwtDecode } from 'jwt-decode'; // Correct the default import
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Add an error state

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });

            // Store the JWT token in localStorage
            const token = res.data.token;
            localStorage.setItem('auth-token', token);

            // Decode the token to get user information
            const user = jwtDecode(token); // Decode JWT to access user info (userType)
            localStorage.setItem('user-email', email); // Store the user's email
            localStorage.setItem('user-type', user.userType); // Store the user type

            // Redirect based on user type
            if (user.userType === 'admin') {
                window.location.href = '/adminHomePage'; // Redirect to admin home page
            } else if (user.userType === 'seller') {
                window.location.href = '/sellerHomePage'; // Redirect to seller home page 
            } else if (user.userType === 'manufacturer') {   
                window.location.href = '/manufacturerHomePage';
            } else {
                window.location.href = '/userHomePage'; // Redirect to user home page
            }


            alert('Logged in successfully!'); // Notify user after redirection
        } catch (err) {
            // Check if the error response status is 403
            if (err.response && err.response.status === 403) {
                setError('Your account is inactive. Please contact support.'); // Set specific error for inactive account
            } else {
                // Set a generic error message for other errors
                setError('Login failed. Please check your email or password.');
            }
        }
    };

    return (
        <div className="page-container"> {/* Using the class for centering */} 
            <div className="form-container"> {/* Form container for styling */}
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-btn">Login</button>
                </form>
                {error && <p className="error-message">{error}</p>} {/* Show error if exists */}
            </div>
        </div>
    );
};

export default Login;
