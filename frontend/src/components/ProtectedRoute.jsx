// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const userRole = localStorage.getItem('user-type'); // Get user type from local storage

    // Check if the user role matches any of the allowed roles
    if (userRole && allowedRoles.includes(userRole)) {
        return element; // Render the element if allowed
    }

    // Redirect to home if not authorized
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
