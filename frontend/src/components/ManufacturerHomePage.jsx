// src/components/ManufacturerHomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManufacturerHomePage.css';

const ManufacturerHomePage = () => {
    const navigate = useNavigate();

    const handlePostProductClick = () => {
        navigate('/manufacturers/product/CRUD'); // Redirects to the product creation page
    };

    const handleManageReviewsClick = () => {
        // Add functionality for Manage Reviews if needed
    };

    const handleViewOrdersClick = () => {
        // Add functionality for View Orders if needed
    };

    return (
        <div className="manufacturer-dashboard-container">
            <h2>Manufacturer Dashboard</h2>
            <div className="dashboard-card">
                <h3>Actions</h3>
                <div className="button-container">
                    <button className="action-btn post-product" onClick={handlePostProductClick}>
                        Post a Product
                    </button>
                    <button className="action-btn manage-reviews" onClick={handleManageReviewsClick}>
                        Manage Reviews
                    </button>
                    <button className="action-btn view-orders" onClick={handleViewOrdersClick}>
                        View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManufacturerHomePage;
