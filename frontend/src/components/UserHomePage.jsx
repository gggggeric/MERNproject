// src/components/UserHomePage.js
import React from 'react';
import './UserHomePage.css'; // Optional: create a CSS file for styling

const UserHomePage = () => {
    const userEmail = localStorage.getItem('user-email'); // Retrieve user's email from local storage

    return (
        <div className="user-home-page">
            <h1>Welcome to Sofa Store!</h1>
            {userEmail && <h2>Your email: {userEmail}</h2>}
            <p>Here you can view your orders and manage your profile.</p>
            <div className="user-actions">
                <button className="action-btn">View Orders</button>
                <button className="action-btn">Update Profile</button>
        
            </div>
        </div>
    );
};

export default UserHomePage;
