import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate(); // Initialize the useNavigate hook
    const userEmail = localStorage.getItem('user-email'); // Retrieve the user's email from local storage
    const userType = localStorage.getItem('user-type'); // Retrieve the user type from local storage

    const handleLogout = () => {
        localStorage.removeItem('auth-token'); // Remove the auth token
        localStorage.removeItem('user-email'); // Remove the user email
        localStorage.removeItem('user-type'); // Remove the user type
        alert('Logged out successfully!'); // Optional: notify user
        navigate('/login'); // Redirect to the login page
    };

    return (
        <nav className="navbar">
            <div className="left-content">
                {userEmail && (
                    <span className="user-email">Logged in as: {userEmail}</span>
                )}
            </div>
            <div className="right-content">
                {userEmail && userType && (
                    <Link to={`/${userType}/editProfile`} className="edit-profile-link">Edit Profile</Link>
                )}
                {userEmail && (
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                )}
            </div>
            {!userEmail && (
                <div className="nav-title">
                    <div className="nav-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
