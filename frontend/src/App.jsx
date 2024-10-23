// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import UserHomePage from './components/UserHomePage';
import SellerHomePage from './components/SellerHomePage';
import AdminHomePage from './components/AdminHomePage';
import Home from './components/Home'; // Assuming you have a home page
import Navbar from './components/Navbar'
import UserCrud from './components/UserCrud';
import Register from './components/Register'
import 'bootstrap-icons/font/bootstrap-icons.css';


const App = () => {
    return (
        <Router>
            <Navbar />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                        path="/userHomePage" 
                        element={
                            <ProtectedRoute 
                                element={<UserHomePage />} 
                                allowedRoles={['user', 'admin']} // Users can access this
                            />
                        } 
                    />
                    <Route 
                        path="/sellerHomePage" 
                        element={
                            <ProtectedRoute 
                                element={<SellerHomePage />} 
                                allowedRoles={['seller', 'admin']} // Only sellers and admins can access
                            />
                        } 
                    />
                    <Route 
                        path="/adminHomePage" 
                        element={
                            <ProtectedRoute 
                                element={<AdminHomePage />} 
                                allowedRoles={['admin']} // Only admins can access
                            />
                        } 
                    />
                     <Route 
                        path="/userCrud" 
                        element={
                            <ProtectedRoute 
                                element={<UserCrud />} 
                                allowedRoles={['admin']} // Only admins can access
                            />
                        } 
                    />
                    {/* Other routes */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
