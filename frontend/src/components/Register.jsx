import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'; // Ensure you're importing from @react-oauth/google
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Handle form submission for regular registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await axios.post('http://localhost:5001/api/auth/register', { email, password });
            setSuccessMessage(res.data.message);
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
        }
    };

    // Handle Google login response
    const responseGoogle = async (credentialResponse) => {
        const { credential } = credentialResponse; // Extract 'credential' from the response

        try {
            const res = await axios.post('http://localhost:5001/api/auth/google/register', { idToken: credential });
            console.log('Google registration response:', res.data);
            setSuccessMessage('Registration with Google successful!');
            setEmail('');
            setPassword(''); // Clear fields after successful registration

            // Optionally, set user status to true (if not already done on the backend)
            // You could also directly navigate the user to a different page after this
        } catch (err) {
            console.error('Google registration error:', err);
            setError('Google registration failed!');
        }
    };

    // Handle Google login failure
    const onFailure = (error) => {
        console.error('Google login failed:', error);
        setError('Google registration failed!');
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Register</button>
                </form>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}

                {/* Google Login Button for Registration */}
                <GoogleLogin
                    onSuccess={responseGoogle} // Handle successful login
                    onFailure={onFailure} // Handle failed login
                    style={{ marginTop: '20px' }} // Add some margin for spacing
                />
            </div>
        </div>
    );
};

export default Register;
