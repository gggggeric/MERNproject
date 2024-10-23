import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserEditProfile.css'; // Optional: Create a CSS file for styling

const UserEditProfile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('user');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state

    const fetchUserProfile = async () => {
        setLoading(true); // Start loading
        try {
            const token = localStorage.getItem('auth-token'); // Retrieve the token from local storage
            const response = await axios.get('http://localhost:5001/api/auth/profile', {
                headers: {
                    'auth-token': token, // Attach the token
                },
            });
            const { email, userType } = response.data;
            setEmail(email);
            setUserType(userType);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching profile!');
        } finally {
            setLoading(false); // End loading
        }
    };

    // Fetch the user's profile on component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            // Prepare the data to be sent; omit password if empty
            const updateData = { email, userType };
            if (password) updateData.password = password; // Only include if not empty

            const res = await axios.put('http://localhost:5001/api/auth/user/details', updateData, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token'), // Attach the token
                },
            });

            setSuccessMessage(res.data.message); // Set the success message
            setPassword(''); // Clear password field after successful update
        } catch (err) {
            setError(err.response?.data?.message || 'Profile update failed!');
        }
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Edit Profile</h2>
                {loading ? ( // Show loading state
                    <p>Loading...</p>
                ) : (
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                placeholder="New Password (optional)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>User Type:</label>
                            <select
                                value={userType}
                                onChange={e => setUserType(e.target.value)}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>
                        <button type="submit" className="submit-btn">Update Profile</button>
                    </form>
                )}
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default UserEditProfile;
