import React from 'react';
import { Box, Button, Container, Typography, Card, CardContent, Grid } from '@mui/material';
import { FaBox, FaClipboardList, FaChartBar } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

const SellerHomePage = () => {
    return (
        <Container sx={{ py: 8, bgcolor: 'background.default' }}>
            <Typography variant="h4" component="span" gutterBottom textAlign="center" color="primary">
                Seller Dashboard
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom textAlign="center">
                Welcome to Your Dashboard!
            </Typography>
            <Typography variant="body1" gutterBottom textAlign="center">
                Select an action below to get started.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {/* Manage Products Card */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ bgcolor: '#FFB74D' }} onClick={() => window.location.href = 'sellerManageProducts'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Box sx={{ bgcolor: 'background.paper', borderRadius: '50%', padding: 2, mb: 2 }}>
                                        <FaBox size={24} />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        Manage Products
                                    </Typography>
                                    <Typography variant="body2">Add, edit, or delete products</Typography>
                                </Box>
                                <Button>
                                    <FaChevronRight size={16} />
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* View Orders Card */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ bgcolor: '#66BB6A' }} onClick={() => window.location.href = '/orders'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Box sx={{ bgcolor: 'background.paper', borderRadius: '50%', padding: 2, mb: 2 }}>
                                        <FaClipboardList size={24} />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        View Orders
                                    </Typography>
                                    <Typography variant="body2">Check your recent orders</Typography>
                                </Box>
                                <Button>
                                    <FaChevronRight size={16} />
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sales Report Card */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ bgcolor: '#42A5F5' }} onClick={() => window.location.href = '/sales-report'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Box sx={{ bgcolor: 'background.paper', borderRadius: '50%', padding: 2, mb: 2 }}>
                                        <FaChartBar size={24} />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        Sales Report
                                    </Typography>
                                    <Typography variant="body2">Analyze your sales performance</Typography>
                                </Box>
                                <Button>
                                    <FaChevronRight size={16} />
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Resell Product Card */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ bgcolor: '#FFCA28' }} onClick={() => window.location.href = '/seller/products'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Box sx={{ bgcolor: 'background.paper', borderRadius: '50%', padding: 2, mb: 2 }}>
                                        <FaBox size={24} />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        Resell Product
                                    </Typography>
                                    <Typography variant="body2">List your products for resale</Typography>
                                </Box>
                                <Button>
                                    <FaChevronRight size={16} />
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SellerHomePage;
