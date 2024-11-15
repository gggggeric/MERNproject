import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

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
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Typography color="error" variant="h6">
                {error}
            </Typography>
        );
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                All Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Shipping Status</TableCell>
                            <TableCell>Order Status</TableCell>
                            <TableCell>Total Price</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order._id}</TableCell>
                                <TableCell>{order.user || 'Unknown'}</TableCell>
                                <TableCell>{order.shippingStatus}</TableCell>
                                <TableCell>{order.orderStatus}</TableCell>
                                <TableCell>{order.totalPrice}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => handleUpdateClick(order)}>
                                        Update
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Update Order Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
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
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateOrder} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateOrderForm;
