import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../photos/logo.png'; // Ensure this path is correct
import { BiEdit, BiLogOut, BiLogIn, BiUserPlus } from 'react-icons/bi'; // Importing icons

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const userEmail = localStorage.getItem('user-email'); // Retrieve the user's email from local storage
    const userType = localStorage.getItem('user-type'); // Retrieve the user type from local storage

    const handleLogout = () => {
        localStorage.removeItem('auth-token'); // Remove the auth token
        localStorage.removeItem('user-email'); // Remove the user email
        localStorage.removeItem('user-type'); // Remove the user type
        alert('Logged out successfully!'); // Optional: notify user
        window.location.href = '/'; // Redirect to the login page and reload
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility

    // Determine the home page URL based on user type
    const getHomePageLink = () => {
        if (userType === 'admin') {
            return "http://localhost:3000/AdminHomePage";
        } else if (userType === 'seller') {
            return "http://localhost:3000/sellerHomePage";
        } else if (userType === 'user') { // Assuming 'user' represents a customer
            return "http://localhost:3000/userHomePage";
        } else if (userType === 'manufacturer') {
            return "http://localhost:3000/ManufacturerHomePage";
        }
        return "#"; // Fallback if userType is not recognized
    };

    // Determine the profile and password edit links based on user type
    const getProfileLink = () => {
        if (userType === 'admin') {
            return "/admin/editProfile"; // Admin profile link
        } else if (userType === 'seller') {
            return "/seller/editProfile"; // Seller profile link
        } else if (userType === 'user') {
            return "/user/editProfile"; // User profile link
        } else if (userType === 'manufacturer') {
            return "/manufacturerProfile"; // Manufacturer profile link
        }
        return "#"; // Fallback if no valid userType
    };

    const getPasswordEditLink = () => {
        if (userType === 'admin') {
            return "/adminEditPassword"; // Admin password edit link
        } else if (userType === 'seller') {
            return "/sellerEditPassword"; // Seller password edit link
        } else if (userType === 'user') {
            return "/userEditPassword"; // User password edit link
        } else if (userType === 'manufacturer') {
            return "/manufacturerEditPassword"; // Manufacturer password edit link
        }
        return "#"; // Fallback if no valid userType
    };

    // Extract the username from the email
    const getUsernameFromEmail = (email) => {
        return email ? email.split('@')[0] : ''; // Get the part before the @ symbol
    };

    const username = getUsernameFromEmail(userEmail); // Extracted username

    return (
        <nav className="navbar">
            <div className="left-content">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="SofaSphere Logo" className="logo" />
                    <span className="store-name">SofaSphere</span> {/* Changed from <a> to <span> */}
                </Link>
            </div>
            <div className="right-content">
                {userEmail && (
                    <Link to={getHomePageLink()} className="home-link">
                        <i className="bi bi-house-fill"></i> Home
                    </Link>
                )}
                {userEmail && userType && (
                    <div className="profile-container" onClick={toggleDropdown}>
                        <span className="edit-profile-link">
                            <i className="bi bi-person-bounding-box"></i> Profile
                        </span>
                        {dropdownOpen && (
                            <div className="dropdown">
                                <div className="user-email-container">
                                    <span className="user-email">Logged in as: {username}</span> {/* Display the username here */}
                                </div>
                                <Link to={getProfileLink()} className="dropdown-item">
                                    <BiEdit className="icon" /> Edit Profile
                                </Link>
                                <Link to={getPasswordEditLink()} className="dropdown-item">
                                    <BiEdit className="icon" /> Edit Password
                                </Link>
                                <Link to="#" className="dropdown-item logout-btn" onClick={handleLogout}>
                                    <BiLogOut className="icon" /> Logout
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                {!userEmail && (
                    <div className="nav-title">
                        <div className="nav-links">
                            <Link to="/login" className="icon-btn">
                                <BiLogIn className="icon" title="Login" /> Login
                            </Link>
                            <Link to="/register" className="icon-btn">
                                <BiUserPlus className="icon" title="Register" /> Register
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
