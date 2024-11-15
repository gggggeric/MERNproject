import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../photos/logo.png'; // Ensure this path is correct
import { BiEdit, BiLogOut, BiLogIn, BiUserPlus, BiPackage, BiCommentDetail } from 'react-icons/bi';
import axios from 'axios'; // Import axios for making the API request

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(require('../photos/image-placeholder.jpg')); // Default profile image
    const userEmail = localStorage.getItem('user-email'); // Retrieve the user's email from local storage
    const userType = localStorage.getItem('user-type'); // Retrieve the user type from local storage

    useEffect(() => {
        // Fetch the user's profile image when the component mounts
        const fetchProfileImage = async () => {
            if (userEmail && userType === 'user') { // Only fetch the image for 'user' type
                try {
                    const response = await axios.get('http://localhost:5001/api/auth/getUserProfileImage', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` }
                    });
                    if (response.data.profileImage) {
                        setProfileImage(response.data.profileImage); // Set the profile image from the response if available
                    } else {
                        setProfileImage(require('../photos/image-placeholder.jpg')); // Fallback to default image if no profile image
                    }
                } catch (error) {
                    console.error('Error fetching profile image:', error);
                    setProfileImage(require('../photos/image-placeholder.jpg')); // Fallback in case of error
                }
            }
        };

        fetchProfileImage();
    }, [userEmail, userType]); // Run the effect when the user email or userType changes

    const handleLogout = () => {
        localStorage.removeItem('auth-token'); // Remove the auth token
        localStorage.removeItem('user-email'); // Remove the user email
        localStorage.removeItem('user-type'); // Remove the user type
        alert('Logged out successfully!');
        window.location.href = '/'; // Redirect to the login page and reload
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility

    // Determine the home page URL based on user type
    const getHomePageLink = () => {
        if (userType === 'admin') {
            return "http://localhost:3000/AdminHomePage";
        } else if (userType === 'seller') {
            return "http://localhost:3000/sellerHomePage";
        } else if (userType === 'user') {
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
            return "/sellerProfile"; // Seller profile link
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
                    <span className="store-name">SofaSphere</span>
                </Link>
            </div>
            <div className="right-content">
                {userEmail && (
                    <>
                        <Link to={getHomePageLink()} className="home-link">
                            <i className="bi bi-house-fill"></i> Home
                        </Link>
                        <div className="separator"></div>
                        {userType === 'user' && (
                            <>
                                <Link to="/view/orders" className="view-orders-link">
                                    <BiPackage className="icon" /> Orders
                                </Link>
                                <div className="separator"></div>
                                <Link to="/user/view/review" className="view-submitted-review-link">
                                    <BiCommentDetail className="icon" /> Reviews
                                </Link>
                                <div className="separator"></div>
                            </>
                        )}
                    </>
                )}
                {userEmail && userType && (
                    <div className="profile-container" onClick={toggleDropdown}>
                        <div className="profile-info">
                            {userType === 'user' && <img src={profileImage} alt="Profile" className="profile-pic" />}
                            <span className="username">{username}</span>
                        </div>
                        {dropdownOpen && (
                            <div className="dropdown">
                                <div className="user-email-container">
                                    <span className="user-email">Logged in as: {username}</span>
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
                            <div className="separator"></div>
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
