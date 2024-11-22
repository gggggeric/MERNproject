import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, CardHeader } from '@mui/material';
import { FaUser, FaFileAlt, FaCog, FaStar, FaExchangeAlt } from 'react-icons/fa'; // Importing icons
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering the components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHomePage = () => {
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    // State to hold the users data for chart
    const [userData, setUserData] = useState({
        userTypes: ['user', 'admin', 'manufacturer'], // Predefined user types for example
        userCounts: [0, 0, 0], // Initial counts set to 0
    });

    // Fetch users and update chart data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const authToken = localStorage.getItem('auth-token'); // Get the token from localStorage
    
                if (!authToken) {
                    console.error('Auth token not found');
                    return; // Handle the case where the token is missing
                }
    
                const response = await fetch('http://localhost:5001/api/auth/admin/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // Use the token here
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
    
                const data = await response.json();
                const userCounts = ['user', 'admin', 'manufacturer'].map(type =>
                    data.users.filter(user => user.userType === type).length
                );
    
                setUserData({
                    userTypes: ['user', 'admin', 'manufacturer'],
                    userCounts,
                });
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
    
        fetchUsers();
    }, []);

    const handleRedirectToUserCrud = () => {
        navigate('/userCrud'); // Redirect to UserCrud page
    };

    const handleRedirectToReports = () => {
        navigate('/reports'); // Redirect to Reports page
    };

    const handleRedirectToSettings = () => {
        navigate('/settings'); // Redirect to Settings page
    };

    const handleRedirectToManageReviews = () => {
        navigate('/admin/review'); // Redirect to Manage Reviews page
    };

    const handleRedirectToUpdateTransaction = () => {
        navigate('/admin/order/update'); // Redirect to Update Transaction page
    };

    return (
        <Container sx={{ py: 8, bgcolor: 'background.default' }}>
            {/* Dashboard Title */}
            <Box textAlign="center" mb={6}>
                <Typography variant="h5" color="primary" fontWeight="bold" letterSpacing={1}>
                    Admin Dashboard
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={2}>
                    Welcome to Your Admin Dashboard!
                </Typography>
                <Typography variant="h6" mt={1}>
                    Use the following options to manage the system.
                </Typography>
            </Box>

            {/* Chart Section */}
            <Grid container spacing={4} mb={6} justifyContent="space-between">
                {/* Chart Section - On the Left */}
                <Grid item md={6} xs={12}>
                    <Box mb={6}>
                        <Typography variant="h5" fontWeight="bold" mb={3}>User Statistics</Typography>
                        <Bar
                            data={{
                                labels: userData.userTypes, // User types
                                datasets: [
                                    {
                                        label: 'Number of Users',
                                        data: userData.userCounts, // User counts
                                        backgroundColor: ['#ffadad', '#ffd6a5', '#fdffb6'],
                                        borderColor: ['#ff3b30', '#ff7f50', '#ffd700'],
                                        borderWidth: 1
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                            // Make the chart smaller
                            sx={{ width: '100%', maxWidth: '500px' }}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Dashboard Actions */}
            <Grid container spacing={4}>
                {/* Manage Accounts Card */}
                <Grid item md={3} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToUserCrud} sx={{ cursor: 'pointer', bgcolor: '#f3e5f5' }}>
                        <CardHeader
                            title="Manage Accounts"
                            subheader="User management"
                            sx={{ textAlign: 'center', bgcolor: '#d1c4e9' }}
                        />
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaUser size={24} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* View Reports Card */}
                <Grid item md={3} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToReports} sx={{ cursor: 'pointer', bgcolor: '#e8f5fe' }}>
                        <CardHeader
                            title="View Reports"
                            subheader="Analyze system data"
                            sx={{ textAlign: 'center', bgcolor: '#c8e6c9' }}
                        />
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaFileAlt size={24} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Settings Card */}
                <Grid item md={3} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToSettings} sx={{ cursor: 'pointer', bgcolor: '#fff3e0' }}>
                        <CardHeader
                            title="Settings"
                            subheader="System preferences"
                            sx={{ textAlign: 'center', bgcolor: '#ffe0b2' }}
                        />
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaCog size={24} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Manage Reviews Card */}
                <Grid item md={3} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToManageReviews} sx={{ cursor: 'pointer', bgcolor: '#e1f5fe' }}>
                        <CardHeader
                            title="Manage Reviews"
                            subheader="View and edit reviews"
                            sx={{ textAlign: 'center', bgcolor: '#b3e5fc' }}
                        />
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaStar size={24} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Manage Transactions Card */}
                <Grid item md={3} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToUpdateTransaction} sx={{ cursor: 'pointer', bgcolor: '#f1f8e9' }}>
                        <CardHeader
                            title="Manage Transactions"
                            subheader="View and update orders"
                            sx={{ textAlign: 'center', bgcolor: '#c8e6c9' }}
                        />
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaExchangeAlt size={24} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;
