import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserEditPassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/auth/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                console.log('Profile Image URL:', res.data.profileImage);  // Check the URL
                setCurrentProfileImageUrl(res.data.profileImage); // Update state
            } catch (err) {
                console.error("Failed to fetch profile image", err);
            }
        };
        fetchProfileImage();
    }, []);
    

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('oldPassword', oldPassword);
            formData.append('password', password);
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await axios.put(
                'http://localhost:5001/api/auth/user/password',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setSuccessMessage(res.data.message);
            if (res.data.profileImage) {
                setCurrentProfileImageUrl(res.data.profileImage);
            }
        } catch (err) {
            console.error(err); // Log the entire error for debugging
            setError(err.response?.data?.message || 'Password update failed!');
        }
    };

    const handleProfileImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Update Password and Profile Image</h2>

                {/* Display Current Profile Image or Placeholder */}
                <div className="profile-image-container">
                <img
  src={currentProfileImageUrl || '/placeholder.png'}
  alt="Current Profile"
  className="profile-image"
  onError={(e) => e.target.src = '/placeholder.png'}  // Fallback if the image fails to load
/>


                </div>

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
                    <div className="form-group">
                        <label>Profile Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                        />
                    </div>
                    <button type="submit" className="submit-btn">Update Profile</button>
                </form>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>

            <style jsx>{`
                .profile-image-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1em;
                }
                .profile-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%; /* Circular frame */
                    object-fit: cover;
                    border: 2px solid #ddd;
                }
            `}</style>
        </div>
    );
};

export default UserEditPassword;
