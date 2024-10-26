// src/components/AdminHomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaFileAlt, FaCog } from 'react-icons/fa'; // Importing icons
import { FaChevronRight } from 'react-icons/fa'; // Importing the Chevron icon
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
        <div className="py-lg-14 bg-light pt-8 pb-8">
            <div className="container">
                <div className="row text-center">
                    <div className="col-md-12 px-lg-8 mb-8 mt-6">
                        <span className="text-uppercase text-primary fw-semibold ls-md">Admin Dashboard</span>
                        <h2 className="h1 fw-bold mt-3">Welcome to Your Dashboard!</h2>
                        <p className="mb-0 fs-4">Select an action below to get started.</p>
                    </div>
                </div>

                <div className="row gy-4">
                    {/* Manage Accounts Card */}
                    <div className="col-md-4 col-12">
                        <div className="card card-purple" onClick={handleRedirectToUserCrud}>
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaUser size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">Manage Accounts</h4>
                                    </div>
                                    <a className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* View Reports Card */}
                    <div className="col-md-4 col-12">
                        <div className="card card-green" onClick={handleRedirectToReports}>
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaFileAlt size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">View Reports</h4>
                                    </div>
                                    <a className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="col-md-4 col-12">
                        <div className="card card-orange" onClick={handleRedirectToSettings}>
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaCog size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">Settings</h4>
                                    </div>
                                    <a className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHomePage;
