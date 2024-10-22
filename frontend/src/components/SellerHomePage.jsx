// SellerHomePage.js
import React from 'react';
import './SellerHomePage.css'; // Add styles here if needed

const SellerHomePage = () => {
    return (
        <div className="seller-home-container">
            <h2>Welcome, Seller!</h2>
            <div className="seller-dashboard">
                <h3>Seller Dashboard</h3>
                <ul>
                    <li><a href="/manage-products">Manage Products</a></li>
                    <li><a href="/orders">View Orders</a></li>
                    <li><a href="/sales-report">Sales Report</a></li>
                </ul>
            </div>
        </div>
    );
};

export default SellerHomePage;
