import React, { useState } from 'react';
import axios from 'axios';

const ManufacturerProfile = () => {
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Retrieve the token from localStorage using the correct key
            const token = localStorage.getItem('auth-token');
            console.log('Token:', token); // Debug log to check token

            const response = await axios.post(
                'http://localhost:5001/api/auth/manufacturerProfile', // Ensure this URL is correct
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

            alert('Profile created successfully');
            // Reset form fields
            setCompanyName('');
            setAddress('');
            setContactNumber('');
        } catch (error) {
            console.error('Error creating profile:', error.response ? error.response.data : error);
            alert('Error creating profile: ' + (error.response ? error.response.data.message : error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
            />
            <button type="submit">Create Profile</button>
        </form>
    );
};

export default ManufacturerProfile;
