// src/components/ManufacturerHomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManufacturerHomePage.css';

const ManufacturerHomePage = () => {
    const navigate = useNavigate();

    const handlePostProductClick = () => {
        navigate('/createProduct'); // Redirects to the product creation page
    };

    return (
        <div className="manufacturer-dashboard-container">
            <h2>Manufacturer Dashboard</h2>
            <div className="dashboard-card">
                <h3>Actions</h3>
                <div className="button-container">
                    <button className="action-btn" onClick={handlePostProductClick}>
                        Post a Product
                    </button>
                    <button className="action-btn">
                        Manage Reviews
                    </button>
                    <button className="action-btn">
                        View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManufacturerHomePage;
