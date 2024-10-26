import React from 'react';
import './SellerHomePage.css'; // Import styles
import { FaBox, FaClipboardList, FaChartBar } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';
const SellerHomePage = () => {
    return (
        <div className="py-lg-14 bg-light pt-8 pb-8">
            {/* Container */}
            <div className="container">
                <div className="row text-center mb-5">
                    {/* Heading */}
                    <div className="col-md-12">
                        <span className="text-uppercase text-primary fw-semibold ls-md">Seller Dashboard</span>
                        <h2 className="h1 fw-bold mt-3">Welcome to Your Dashboard!</h2>
                        <p className="mb-0 fs-4">Select an action below to get started.</p>
                    </div>
                </div>

                <div className="row gy-4">
                    {/* First Row of Cards */}
                    <div className="col-md-6 col-12 mb-4">
                        <div className="card card-orange">
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaBox size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">Manage Products</h4>
                                        <p className="mb-0">Add, edit, or delete products</p>
                                    </div>
                                    <a href="/manage-products" className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-12 mb-4">
                        <div className="card card-green">
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaClipboardList size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">View Orders</h4>
                                        <p className="mb-0">Check your recent orders</p>
                                    </div>
                                    <a href="/orders" className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row of Cards */}
                    <div className="col-md-6 col-12 mb-4">
                        <div className="card card-blue">
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaChartBar size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0">Sales Report</h4>
                                        <p className="mb-0">Analyze your sales performance</p>
                                    </div>
                                    <a href="/sales-report" className="text-inherit">
                                        <FaChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-12 mb-4">
                        <div className="card card-yellow">
                            <div className="card-body">
                                <div className="icon-shape icon-lg rounded-circle bg-light mb-3 card-icon">
                                    <FaBox size={24} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between" >
                                    <div>
                                        <h4 className="mb-0">Resell Product</h4>
                                        <p className="mb-0">List your products for resale</p>
                                    </div>
                                    <a href="/seller/products" className="text-inherit">
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

export default SellerHomePage;
