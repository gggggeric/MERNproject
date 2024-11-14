import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserEditPassword.css';

const UserEditPassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        password: '',
        confirmPassword: '',
        profileImage: null,
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        }
    });
    const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState('/placeholder.png');
    const [showAddressFields, setShowAddressFields] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/auth/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                // If profile image exists, set it to Cloudinary URL or default placeholder
                setCurrentProfileImageUrl(res.data.profileImage || '/placeholder.png');
                setFormData((prevState) => ({
                    ...prevState,
                    address: res.data.address || {}
                }));
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            address: {
                ...prevData.address,
                [name]: value
            }
        }));
    };

    const handleProfileImageChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            profileImage: e.target.files[0]
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Validate if password and confirm password match (only if password is provided)
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        // Password criteria validation (only if password is provided)
        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Only append old and new password if the password fields are filled
            if (formData.oldPassword && formData.password) {
                formDataToSend.append('oldPassword', formData.oldPassword);
                formDataToSend.append('password', formData.password);
            }

            // Append profile image if uploaded
            if (formData.profileImage) {
                formDataToSend.append('profileImage', formData.profileImage);
            }

            // Append address if the checkbox is checked and address fields are filled
            if (showAddressFields && (formData.address.street || formData.address.city || formData.address.state || formData.address.postalCode || formData.address.country)) {
                formDataToSend.append('address', JSON.stringify(formData.address));
            }

            const res = await axios.put(
                'http://localhost:5001/api/auth/user/password', // Your backend URL
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setSuccessMessage(res.data.message);

            // Update profile image URL if the response contains the new image
            if (res.data.profileImage) {
                setCurrentProfileImageUrl(res.data.profileImage);  // This should be the Cloudinary URL
            }

            // Reset form after successful update
            setFormData({
                oldPassword: '',
                password: '',
                confirmPassword: '',
                profileImage: null,
                address: {
                    street: '',
                    city: '',
                    postalCode: '',
                    country: '',
                    state: '' // Reset state to empty
                }
            });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Profile update failed!');
        }
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Update Profile</h2>

                {/* Display Current Profile Image or Placeholder */}
                <div className="profile-image-container">
                    <img
                        src={currentProfileImageUrl}
                        alt="Current Profile"
                        className="profile-image"
                        onError={(e) => e.target.src = '/placeholder.png'}
                    />
                </div>

                <form onSubmit={handleUpdateProfile}>
                    {/* Password Fields (only included if password is being updated) */}
                    <div className="form-group">
                        <label>Old Password:</label>
                        <input
                            type="password"
                            name="oldPassword"
                            placeholder="Old Password"
                            value={formData.oldPassword}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="New Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Profile Image Field */}
                    <div className="form-group">
                        <label>Profile Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                        />
                    </div>

                    {/* Address Section */}
                    <div className="form-group">
                        <label>Update Address:</label>
                        <input
                            type="checkbox"
                            checked={showAddressFields}
                            onChange={() => setShowAddressFields(!showAddressFields)}
                        />
                        <span> Yes, update my address</span>
                    </div>

                    {showAddressFields && (
                        <div className="address-fields">
                            <div className="form-group">
                                <label>Street:</label>
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Street"
                                    value={formData.address.street}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>City:</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.address.city}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>State:</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.address.state}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Postal Code:</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    value={formData.address.postalCode}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Country:</label>
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={formData.address.country}
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="submit-btn">Update Profile</button>
                </form>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default UserEditPassword;
