import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Card, CardContent } from '@mui/material';

const ManufacturerHomePage = () => {
    const navigate = useNavigate();

    const handlePostProductClick = () => {
        navigate('/manufacturers/product/CRUD'); // Redirects to the product creation page
    };

    const handleManageReviewsClick = () => {
        // Add functionality for Manage Reviews if needed
    };

    const handleViewOrdersClick = () => {
      
        navigate('/manufacturers/orders'); // Redirects to the product creation page
    };

    return (
        <Container sx={{ py: 8, bgcolor: 'background.default' }}>
            <Typography variant="h4" component="h2" gutterBottom textAlign="center">
                Manufacturer Dashboard
            </Typography>

            <Card variant="outlined" sx={{ textAlign: 'center', mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                        Actions
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2}>
                        <Button variant="contained" color="primary" onClick={handlePostProductClick}>
                            Post a Product
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleManageReviewsClick}>
                            Manage Reviews
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleViewOrdersClick}>
                            View Orders
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ManufacturerHomePage;
