// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const userRole = localStorage.getItem('user-type'); // Get user type from local storage

    // Check if the user role matches any of the allowed roles
    if (userRole && allowedRoles.includes(userRole)) {
        return element; // Render the element if allowed
    }

    // Redirect to respective homepages based on user role
    if (userRole === 'seller') {
        return <Navigate to="/sellerHomePage" replace />; // Redirect to seller homepage
    } else if (userRole === 'manufacturer') {
        return <Navigate to="/manufacturerHomePage" replace />; // Redirect to manufacturer homepage
    } else if (userRole === 'user') {
        return <Navigate to="/userHomePage" replace />; // Redirect to user homepage
    }

    // Redirect to home if user role is not recognized
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
