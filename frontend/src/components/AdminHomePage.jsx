// src/components/AdminHomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHomePage.css';

const AdminHomePage = () => {
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    const handleRedirectToUserCrud = () => {
        navigate('/userCrud'); // Redirect to UserCrud page
    };

    const handleRedirectToReports = () => {
        navigate('/reports'); // Redirect to Reports page
    };

    const handleRedirectToSettings = () => {
        navigate('/settings'); // Redirect to Settings page
    };

    return (
        <div className="admin-home-container">
            <h2>Admin Dashboard</h2>
            <div className="dashboard-container">
                {/* Card for Manage Accounts */}
                <div className="dashboard-card manage-accounts-container" onClick={handleRedirectToUserCrud}>
                    <h3>Manage Accounts</h3>
                </div>

                {/* Card for View Reports */}
                <div className="dashboard-card view-reports" onClick={handleRedirectToReports}>
                    <h3>View Reports</h3>
                </div>

                {/* Card for Settings */}
                <div className="dashboard-card settings" onClick={handleRedirectToSettings}>
                    <h3>Settings</h3>
                </div>
            </div>
        </div>
    );
};

export default AdminHomePage;
