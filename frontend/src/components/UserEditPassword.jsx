import React, { useState } from 'react';
import axios from 'axios';

const UserEditPassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        try {
            const res = await axios.put(
                'http://localhost:5001/api/auth/user/password',
                { oldPassword, password },  // Sending old and new password
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`, // Pass token
                    },
                }
            );
            setSuccessMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Password update failed!');
        }
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Update Password</h2>
                <form onSubmit={handleUpdatePassword}>
                    <div className="form-group">
                        <label>Old Password:</label>
                        <input
                            type="password"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Update Password</button>
                </form>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default UserEditPassword;
