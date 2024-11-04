import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, IconButton } from '@mui/material';
import { FaUser, FaFileAlt, FaCog } from 'react-icons/fa'; // Importing icons
import { FaChevronRight } from 'react-icons/fa'; // Importing the Chevron icon

const AdminHomePage = () => {
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    const handleRedirectToUserCrud = () => {
        navigate('/userCrud'); // Redirect to UserCrud page
    };

    const handleRedirectToReports = () => {
        navigate('/reports'); // Redirect to Reports page
    };

    const handleRedirectToSettings = () => {
        navigate('/settings'); // Redirect to Settings page
    };

    return (
        <Container sx={{ py: 8, bgcolor: 'background.default' }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h5" color="primary" fontWeight="bold" letterSpacing={1}>
                    Admin Dashboard
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={2}>
                    Welcome to Your Dashboard!
                </Typography>
                <Typography variant="h6" mt={1}>
                    Select an action below to get started.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Manage Accounts Card */}
                <Grid item md={4} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToUserCrud} sx={{ cursor: 'pointer', bgcolor: '#f3e5f5' }}>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaUser size={24} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Manage Accounts</Typography>
                                <IconButton>
                                    <FaChevronRight size={16} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* View Reports Card */}
                <Grid item md={4} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToReports} sx={{ cursor: 'pointer', bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaFileAlt size={24} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">View Reports</Typography>
                                <IconButton>
                                    <FaChevronRight size={16} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Settings Card */}
                <Grid item md={4} xs={12}>
                    <Card variant="outlined" onClick={handleRedirectToSettings} sx={{ cursor: 'pointer', bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Box sx={{ bgcolor: 'lightgray', borderRadius: '50%', p: 2, mb: 2 }}>
                                    <FaCog size={24} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Settings</Typography>
                                <IconButton>
                                    <FaChevronRight size={16} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;
