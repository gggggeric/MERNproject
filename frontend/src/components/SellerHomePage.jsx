import React from 'react';
import './SellerHomePage.css'; // Add styles here if needed
import { FaBox, FaClipboardList, FaChartBar } from 'react-icons/fa'; // Importing icons

const SellerHomePage = () => {
    return (
        <div className="seller-home-container">
            <h2>Welcome, Seller!</h2>
            <div className="seller-dashboard">
                <h3>Seller Dashboard</h3>
                <ul className="dashboard-links">
                    <li>
                        <a href="/manage-products" className="link-container green">
                            <FaBox className="icon" /> Manage Products
                        </a>
                    </li>
                    <li>
                        <a href="/orders" className="link-container blue">
                            <FaClipboardList className="icon" /> View Orders
                        </a>
                    </li>
                    <li>
                        <a href="/sales-report" className="link-container orange">
                            <FaChartBar className="icon" /> Sales Report
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SellerHomePage;
