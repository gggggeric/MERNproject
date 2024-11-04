// src/components/UserHomePage.js
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const UserHomePage = () => {
    const userEmail = localStorage.getItem('user-email'); // Retrieve user's email from local storage

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Welcome to Sofa Store!
            </Typography>
            {userEmail && (
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    Your email: {userEmail}
                </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 4 }}>
                Here you can view your orders and manage your profile.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" color="primary">
                    View Orders
                </Button>
                <Button variant="outlined" color="secondary">
                    Update Profile
                </Button>
            </Box>
        </Container>
    );
};

export default UserHomePage;
