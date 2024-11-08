import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, CircularProgress, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserHomePage.css';

const UserHomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const userEmail = localStorage.getItem('user-email');
    const navigate = useNavigate();

    // Function to render stars for product rating
    const renderStars = (rating) => {
        const totalStars = 5;
        let stars = [];
        for (let i = 1; i <= totalStars; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#FFD700' : '#ddd' }}>★</span>
            );
        }
        return stars;
    };

    // Fetch products with pagination
    const fetchProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get('http://localhost:5001/api/auth/user/products', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { page, limit: 10 }
            });

            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prevProducts => [...prevProducts, ...res.data]);
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Infinite scrolling logic
    const handleScroll = useCallback(() => {
        const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
        if (bottom && hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
            setLoading(true);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // Handle placing the order
    const handlePlaceOrder = async (product) => {
        const token = localStorage.getItem('auth-token');
        const orderDataToSend = {
            products: [
                { product: product._id, quantity: quantity }
            ]
        };

        try {
            // Send the order to the backend
            await axios.post('http://localhost:5001/api/auth/order/place', orderDataToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // After placing the order, close the modal and reset quantity
            setOpenModal(false);
            setQuantity(1);  // Reset quantity
        } catch (err) {
            alert('Failed to place the order. Please try again.');
        }
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value) || 1); // Validate quantity input
        setQuantity(value);
    };

    // Loading or error handling UI
    if (loading && page === 1) {
        return (
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography variant="h5" sx={{ mt: 2 }}>Loading products...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f0f0f0', mb: 4 }}>
                {userEmail && (
                    <Typography variant="h5" component="h2" sx={{ mb: 2, color: '#666' }}>
                        Your email: {userEmail}
                    </Typography>
                )}
                <Typography variant="body1" sx={{ color: '#555' }}>
                    Here you can view your products and manage your profile.
                </Typography>
            </Paper>

            {/* Displaying Products */}
            <Grid container spacing={4}>
                {products.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <Card sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 } }}>
                            <CardMedia component="img" alt={product.name} height="200" image={`http://localhost:5001/${product.image}`} sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                            <CardContent sx={{ backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                                <Typography variant="h6" sx={{ mt: 2, color: '#1976d2' }}>Price: ${product.price}</Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>Company: {product.companyName}</Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>Stock: {product.stock}</Typography>

                                {/* Render Rating */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>Rating: </Typography>
                                    <Box sx={{ ml: 1, display: 'flex' }}>
                                        {renderStars(product.averageRating || 0)} {/* Default rating to 0 if not available */}
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button variant="outlined" color="secondary" onClick={() => handleOpenModal(product)}>Place Order</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Loading spinner while fetching more data */}
            {loading && hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Place Order Modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Place Order for {selectedProduct?.name}</DialogTitle>
                <DialogContent>
                    <TextField label="Quantity" type="number" value={quantity} onChange={handleQuantityChange} fullWidth margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                    <Button onClick={() => handlePlaceOrder(selectedProduct)} color="primary">Place Order</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserHomePage;
