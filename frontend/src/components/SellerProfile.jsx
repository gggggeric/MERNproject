import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SellerProfile.css'; // Ensure to create a CSS file for custom styling

const SellerProfile = () => {
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [message, setMessage] = useState(''); // State for error/success message
    const [profile, setProfile] = useState(null); // State to store the existing profile
    const [loading, setLoading] = useState(true); // Loading state for profile fetch

    useEffect(() => {
        // Fetch existing profile on component mount
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await axios.get('http://localhost:5001/api/auth/sellerProfile', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the headers
                    },
                });
                setProfile(response.data); // Store the profile data
                setLoading(false); // Set loading to false once profile is fetched
            } catch (error) {
                console.error('Error fetching profile:', error.response ? error.response.data : error);
                setLoading(false); // Set loading to false in case of an error
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth-token');
            await axios.post(
                'http://localhost:5001/api/auth/sellerProfile',
                {
                    storeName,
                    address,
                    contactNo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the headers
                    },
                }
            );

            setMessage('Profile created successfully');
            // Reset form fields
            setStoreName('');
            setAddress('');
            setContactNo('');
        } catch (error) {
            console.error('Error creating profile:', error.response ? error.response.data : error);
            setMessage('Error creating profile: ' + (error.response ? error.response.data.message : error.message)); // Set error message
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading spinner or message while fetching data
    }

    return (
        <div className="seller-profile-container"> {/* Main container */}
            {profile ? ( // If profile exists, show the profile details
                <div className="seller-profile-details">
                    <h1>Seller Profile</h1>
                    <p><strong>Store Name:</strong> {profile.storeName}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Contact Number:</strong> {profile.contactNo}</p>
                    <button onClick={() => {
                        // Optional: add functionality to edit the profile
                        setMessage('Editing profile functionality not implemented yet.'); // Temporary message
                    }}>Edit Profile</button>
                </div>
            ) : ( // If no profile exists, show the form to create one
                <>
                    <div className="seller-profile-header">
                        <h1>Create Seller Profile</h1>
                    </div>
                    <form className="seller-profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="storeName">Store Name</label>
                            <input
                                type="text"
                                id="storeName"
                                placeholder="Store Name"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contactNo">Contact Number</label>
                            <input
                                type="text"
                                id="contactNo"
                                placeholder="Contact Number"
                                value={contactNo}
                                onChange={(e) => setContactNo(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Create Profile</button>
                        {message && <div className="message">{message}</div>} {/* Display success/error message */}
                    </form>
                </>
            )}
        </div>
    );
};

export default SellerProfile;
