import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import the provider
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import UserHomePage from './components/UserHomePage';
import AdminHomePage from './components/AdminHomePage';
import Home from './components/Home'; // Assuming you have a home page
import Navbar from './components/Navbar';
import UserCrud from './components/UserCrud';
import Register from './components/Register';
import ManufacturerHomePage from './components/ManufacturerHomePage';
import ManufacturerEditPassword from './components/ManufacturerEditPassword';
import UserEditPassword from './components/UserEditPassword';
import ManufacturerProfile from './components/ManufacturerProfile';
import ManufacturerProductCRUD from './components/ManufacturerProductCRUD';
import Cart from './components/Cart';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "slick-carousel/slick/slick-theme.css"; 

const App = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Ensure the client ID is set

    return (
        <GoogleOAuthProvider clientId={clientId}>
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
                            path="/cart/user" 
                            element={
                                <ProtectedRoute 
                                    element={<Cart />} 
                                    allowedRoles={['user']}
                                />
                            } 
                        />
                    </Routes>
                </div>
            </Router>
        </GoogleOAuthProvider>
    );
};

export default App;
