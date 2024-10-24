import React, { useState } from 'react';
import axios from 'axios';
import './ManufacturerProfile.css'; // Import the new CSS file

const ManufacturerProfile = () => {
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [message, setMessage] = useState(''); // State for error/success message

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth-token');
            console.log('Token:', token); // Debug log to check token

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

            setMessage('Profile created successfully'); // Set success message
            // Reset form fields
            setCompanyName('');
            setAddress('');
            setContactNumber('');
        } catch (error) {
            console.error('Error creating profile:', error.response ? error.response.data : error);
            setMessage('Error creating profile: ' + (error.response ? error.response.data.message : error.message)); // Set error message
        }
    };

    return (
        <div className="manufacturer-profile-container"> {/* Main container */}
            <div className="manufacturer-profile-header"> {/* Header section */}
                <h1>Create Manufacturer Profile</h1>
            </div>
            <form className="manufacturer-profile-form" onSubmit={handleSubmit}> {/* Form section */}
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
        </div>
    );
};

export default ManufacturerProfile;
