import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

const Order = () => {
    const { state } = useLocation(); // Get the state passed from the previous page (HomePage)
    const [order, setOrder] = useState(state?.order || null); // Set order data from location state

    useEffect(() => {
        if (!order) {
            // If the order is not available, you can redirect or show an error
            console.error('Order data not found!');
        }
    }, [order]);

    if (!order) {
        return (
            <Container>
                <Typography variant="h6" color="error">
                    Order not found. Please try again.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ padding: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Order Confirmation
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Order ID: {order._id}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Total Price: ${order.totalPrice}
                </Typography>

                <Typography variant="h6" sx={{ mt: 3 }}>
                    Products:
                </Typography>
                {order.products.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">{item.product.name}</Typography>
                        <Typography variant="body2">Quantity: {item.quantity}</Typography>
                    </Box>
                ))}

                <Button variant="contained" color="primary" sx={{ mt: 3 }}>
                    Proceed with Payment
                </Button>
            </Paper>
        </Container>
    );
};

export default Order;
