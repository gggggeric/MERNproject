import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'; // Import Google Login
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });

            // Store the JWT token in localStorage
            const token = res.data.token;
            localStorage.setItem('auth-token', token);
            console.log('Token stored:', token); // Debugging line

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
    const responseGoogle = async (credentialResponse) => {
        const { credential } = credentialResponse;
    
        console.log('Sending Google ID Token:', { idToken: credential }); // Log the token being sent
    
        try {
            const res = await axios.post('http://localhost:5001/api/auth/google/login', { idToken: credential });
            const token = res.data.token;
            localStorage.setItem('auth-token', token);
            console.log('Google Token stored:', token); // Debugging line
    
            // Decode the token to get user information
            const user = jwtDecode(token); // Decode JWT to access user info (userType)
            localStorage.setItem('user-email', user.email); // Store the user's email
            localStorage.setItem('user-type', user.userType); // Store the user type
    
            // Redirect based on user type
            redirectUser(user.userType);
    
            alert('Logged in successfully with Google!'); // Notify user after redirection
        } catch (err) {
            console.error('Google login error:', err);
            setError('Google login failed! Please try again.'); // Generic error message for Google login failure
        }
    };

    const redirectUser = (userType) => {
        // Redirect the user based on their type
        switch (userType) {
            case 'admin':
                window.location.href = '/adminHomePage'; // Redirect to admin home page
                break;
            case 'seller':
                window.location.href = '/sellerHomePage'; // Redirect to seller home page 
                break;
            case 'manufacturer':   
                window.location.href = '/manufacturerHomePage';
                break;
            default:
                window.location.href = '/userHomePage'; // Redirect to user home page
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

                {/* Google Login Button for Google Authentication */}
                <GoogleLogin
                    onSuccess={responseGoogle} // Handle successful login
                    onFailure={(error) => {
                        console.error('Google login failed:', error);
                        setError('Google login failed! Please try again.'); // Generic error message for Google login failure
                    }}
                    style={{ marginTop: '20px' }} // Add some margin for spacing
                />
            </div>
        </div>
    );
};

export default Login;
