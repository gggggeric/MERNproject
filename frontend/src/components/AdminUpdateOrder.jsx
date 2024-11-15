import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Grid, 
  CircularProgress, 
  Paper 
} from '@mui/material';

const UpdateOrderForm = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [shippingStatus, setShippingStatus] = useState('');

    // Fetch all orders when the component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('auth-token'); // Assuming token is stored in localStorage

                if (!token) {
                    setError('No token found. Please log in.');
                    setLoading(false);
                    return;
                }

                // Making request to fetch orders only if the user is an admin
                const response = await axios.get('http://localhost:5001/api/auth/admin/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Passing the token in Authorization header
                    },
                });

                // Handle successful response
                setOrders(response.data.orders);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching orders:', err);
                if (err.response && err.response.status === 403) {
                    setError('Access denied. Admins only.');
                } else {
                    setError('Failed to fetch orders.');
                }
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);  // Empty dependency array ensures this runs once when the component mounts

    const handleUpdateClick = (order) => {
        // Pre-fill the form with the current order's shipping status
        setCurrentOrder(order);
        setShippingStatus(order.shippingStatus);  // Pre-fill with the current shipping status
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentOrder(null);
        setShippingStatus('');
    };

    const handleUpdateOrder = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
    
            // Ensure the shippingStatus is valid
            if (!['Pending', 'Delivered'].includes(shippingStatus)) {
                setError('Invalid shipping status. Choose either "Pending" or "Delivered".');
                return;
            }
    
            if (!currentOrder) {
                setError('No order selected.');
                return;
            }
    
            const updatedOrder = {
                shippingStatus, // Only updating the shipping status
            };
    
            // Perform the PUT request to update the order
            await axios.put(
                `http://localhost:5001/api/auth/admin/updateTransaction/${currentOrder._id}`,
                updatedOrder,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            // Refresh the orders list after the update
            const response = await axios.get('http://localhost:5001/api/auth/admin/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setOrders(response.data.orders);
            handleCloseDialog();
        } catch (err) {
            console.error('Error updating order:', err);
            setError(err.response ? err.response.data.message : 'Failed to update the order.');
        }
    };

    if (loading) {
        return <CircularProgress style={{ display: 'block', margin: 'auto' }} />;
    }

    if (error) {
        return (
            <Typography color="error" variant="h6" align="center" style={{ marginBottom: '20px' }}>
                {error}
            </Typography>
        );
    }

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom align="center" color="textSecondary">
                Manage Orders
            </Typography>

            <Grid container spacing={3}>
                {orders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order._id}>
                        <Card elevation={5} style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <CardContent>
                            <Typography 
    variant="h6" 
    gutterBottom 
    style={{ 
        fontWeight: '600', 
        color: '#8e44ad', 
        border: '2px solid #3498db',  // Border color
        padding: '5px',               // Padding to give space inside the border
        borderRadius: '4px',          // Rounded corners
        display: 'inline-block'       // To prevent it from stretching full width
    }}
>
    Order ID: {order._id}
</Typography>

                                <Typography variant="body1" color="textSecondary">User: {order.user || 'Unknown'}</Typography>
                                <Typography variant="body1" color="textSecondary">Shipping Status: {order.shippingStatus}</Typography>
                                <Typography variant="body1" color="textSecondary">Order Status: {order.orderStatus}</Typography>
                                <Typography variant="body1" color="textSecondary">Total Price: ${order.totalPrice}</Typography>

                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    fullWidth 
                                    style={{ marginTop: '15px', fontSize: '14px', fontWeight: '500' }}
                                    onClick={() => handleUpdateClick(order)}
                                >
                                    Update Shipping Status
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Update Order Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Update Shipping Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Shipping Status</InputLabel>
                        <Select
                            value={shippingStatus}
                            onChange={(e) => setShippingStatus(e.target.value)}
                            label="Shipping Status"
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Delivered">Delivered</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateOrder} color="primary" variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateOrderForm;
