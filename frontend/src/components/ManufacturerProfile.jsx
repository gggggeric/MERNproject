import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManufacturerProfile.css'; // Import the new CSS file

const ManufacturerProfile = () => {
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [message, setMessage] = useState(''); // State for error/success message
    const [profile, setProfile] = useState(null); // State to store the existing profile
    const [loading, setLoading] = useState(true); // Loading state for profile fetch

    useEffect(() => {
        // Fetch existing profile on component mount
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await axios.get('http://localhost:5001/api/auth/manufacturerProfile', {
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
                'http://localhost:5001/api/auth/manufacturerProfile',
                {
                    companyName,
                    address,
                    contactNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the headers
                    },
                }
            );

            setMessage('Profile created successfully');
            // Reset form fields
            setCompanyName('');
            setAddress('');
            setContactNumber('');
        } catch (error) {
            console.error('Error creating profile:', error.response ? error.response.data : error);
            setMessage('Error creating profile: ' + (error.response ? error.response.data.message : error.message)); // Set error message
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading spinner or message while fetching data
    }

    return (
        <div className="manufacturer-profile-container"> {/* Main container */}
            {profile ? ( // If profile exists, show the profile details
                <div className="manufacturer-profile-details">
                    <h1>Manufacturer Profile</h1>
                    <p><strong>Company Name:</strong> {profile.companyName}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Contact Number:</strong> {profile.contactNumber}</p>
                </div>
            ) : ( // If no profile exists, show the form to create one
                <>
                    <div className="manufacturer-profile-header">
                        <h1>Create Manufacturer Profile</h1>
                    </div>
                    <form className="manufacturer-profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input
                                type="text"
                                id="companyName"
                                placeholder="Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
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
                            <label htmlFor="contactNumber">Contact Number</label>
                            <input
                                type="text"
                                id="contactNumber"
                                placeholder="Contact Number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
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

export default ManufacturerProfile;
