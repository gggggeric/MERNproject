import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../photos/logo.png'; // Ensure this path is correct

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility

    // Determine the home page URL based on user type
    const getHomePageLink = () => {
        if (userType === 'admin') {
            return "http://localhost:3000/AdminHomePage";
        } else if (userType === 'seller') {
            return "http://localhost:3000/sellerHomePage";
        } else if (userType === 'user') { // Assuming 'user' represents a customer
            return "http://localhost:3000/UserHomePage";
        }
        return "#"; // Fallback if userType is not recognized
    };

    return (
        <nav className="navbar">
            <div className="left-content">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="SofaSphere Logo" className="logo" />
                    <span className="store-name">SofaSphere</span>
                </Link>
            </div>
            <div className="right-content">
                {userEmail && ( // Only show the Home link if the user is logged in
                    <Link to={getHomePageLink()} className="home-link">
                        <i className="bi bi-house-fill"></i> Home
                    </Link>
                )}
                {userEmail && userType && (
                    <Link to={`/${userType}/editProfile`} className="edit-profile-link">
                        <i className="bi bi-person-bounding-box"></i> Profile
                    </Link>
                )}
                {userEmail && (
                    <div className="user-email-container" onClick={toggleDropdown}>
                        <span className="user-email">Logged in as: {userEmail}</span>
                        {dropdownOpen && (
                            <div className="dropdown">
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
                {!userEmail && (
                    <div className="nav-title">
                        <div className="nav-links">
                            <button className="nav-btn login-btn">
                                <Link to="/login">Login</Link>
                            </button>
                            <button className="nav-btn register-btn">
                                <Link to="/register">Register</Link>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
