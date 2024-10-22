// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Assuming you have a CSS file for styling

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // State for handling errors
    const [successMessage, setSuccessMessage] = useState(null); // State for handling success messages

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null); // Clear any existing errors
        setSuccessMessage(null); // Clear any existing success messages

        try {
            // Sending email and password to the backend API
            const res = await axios.post('http://localhost:5001/api/auth/register', { email, password });

            // Display success message
            setSuccessMessage(res.data.message); // Set the success message
            setEmail(''); // Clear email input
            setPassword(''); // Clear password input
        } catch (err) {
            // Handle errors and display error message
            setError(err.response?.data?.message || 'Registration failed!');
        }
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
                {successMessage && <p className="success-message">{successMessage}</p>} {/* Display success message */}
                {error && <p className="error-message">{error}</p>} {/* Display error if exists */}
            </div>
        </div>
    );
};

export default Register;
