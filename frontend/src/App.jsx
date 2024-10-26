// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import UserHomePage from './components/UserHomePage';
import SellerHomePage from './components/SellerHomePage';
import AdminHomePage from './components/AdminHomePage';
import Home from './components/Home'; // Assuming you have a home page
import Navbar from './components/Navbar';
import UserCrud from './components/UserCrud';
import Register from './components/Register';
import ManufacturerHomePage from './components/ManufacturerHomePage';
import ManufacturerEditPassword from './components/ManufacturerEditPassword';
import UserEditPassword from './components/UserEditPassword';
import ManufacturerProfile from './components/ManufacturerProfile';
import SellerEditPassword from './components/SellerEditPassword';
import ManufacturerProductCRUD from './components/ManufacturerProductCRUD';
import ResellProducts from './components/ResellProducts';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "slick-carousel/slick/slick-theme.css"; 

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
                    <Route 
                        path="/manufacturerHomePage" 
                        element={
                            <ProtectedRoute 
                                element={<ManufacturerHomePage />} 
                                allowedRoles={['manufacturer', 'admin']} // Only manufacturers can access
                            />
                        } 
                    />
                    <Route 
                        path="/userEditPassword" 
                        element={
                            <ProtectedRoute 
                                element={<UserEditPassword />} 
                                allowedRoles={['user']}
                            />
                        } 
                    />
                    <Route 
                        path="/sellerEditPassword" 
                        element={
                            <ProtectedRoute 
                                element={<SellerEditPassword />} 
                                allowedRoles={['seller']}
                            />
                        } 
                    />
                    <Route 
                        path="/manufacturerEditPassword" 
                        element={
                            <ProtectedRoute 
                                element={<ManufacturerEditPassword />} 
                                allowedRoles={['manufacturer']}
                            />
                        } 
                    />
                    <Route 
                        path="/manufacturerProfile" 
                        element={
                            <ProtectedRoute 
                                element={<ManufacturerProfile />} 
                                allowedRoles={['manufacturer']}
                            />
                        } 
                    />
                    <Route 
                        path="/manufacturers/product/CRUD" 
                        element={
                            <ProtectedRoute 
                                element={<ManufacturerProductCRUD />} 
                                allowedRoles={['manufacturer']}
                            />
                        } 
                    />
                    <Route 
                        path="/resell-products" 
                        element={
                            <ProtectedRoute 
                                element={<ResellProducts />} 
                                allowedRoles={['seller', 'admin']} // Update roles if necessary
                            />
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
