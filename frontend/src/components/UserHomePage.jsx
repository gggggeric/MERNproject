import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, CircularProgress, Paper, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserHomePage = () => {
    const [products, setProducts] = useState([]); // State to hold products
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [error, setError] = useState(null); // State to manage errors
    const userEmail = localStorage.getItem('user-email'); // Retrieve user's email from local storage
    const navigate = useNavigate(); // Hook for navigation
    const [quantity, setQuantity] = useState(1); // Initialize quantity state

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            console.log('Token:', token); // Log token to check its validity
            
            const res = await axios.get('http://localhost:5001/api/auth/user/products', {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the request header
                }
            });
            console.log(res.data); // Log the products data
            setProducts(res.data); // Set the fetched products to state
            setLoading(false); // Update loading state to false after fetching
        } catch (err) {
            console.error('Error fetching products:', err); // Log any errors
            setError('Failed to load products. Please try again later.'); // Set error message
            setLoading(false); // Update loading state to false on error
        }
    };

    useEffect(() => {
        fetchProducts(); // Fetch products when the component mounts
    }, []);

    const handleAddToCart = async (product) => {
        const productId = product._id; // Get the product ID from the clicked product
        try {
            // Retrieve the token from localStorage
            const token = localStorage.getItem('auth-token');

            // Ensure the token is set in the headers
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Set the token in the header
                },
            };

            // Make the request to add to the cart
            const res = await axios.post('http://localhost:5001/api/auth/cart/add', 
            { productId, quantity }, config);

            console.log('Add to cart response:', res.data); // Log response for debugging
            alert(res.data.message); // Notify user of success
        } catch (err) {
            console.error('Error adding to cart:', err); // Log the error for debugging
            // Set specific error messages based on response status
            if (err.response && err.response.status === 403) {
                setError('Access denied: You are not authorized to add items to the cart.');
            } else if (err.response && err.response.status === 404) {
                setError('Product not found. Please check the product ID.');
            } else {
                setError('Error adding to cart. Please try again later.');
            }
        }
    };
    const handlePlaceOrder = async (orderData) => {
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
            console.error('No token found in localStorage');
            alert('You must be logged in to place an order.');
            return;
        }
    
        // Log the orderData to inspect the format
        console.log('Order data being sent:', orderData);
    
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    
        try {
            const response = await axios.post('http://localhost:5001/api/auth/order/place', orderData, config);
            console.log('Order placed successfully:', response.data);
            alert('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error.response);
            alert('Failed to place the order. Please try again.');
        }
    };
    
    
    // Show loading spinner while fetching products
    if (loading) {
        return (
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography variant="h5" sx={{ mt: 2 }}>Loading products...</Typography>
            </Container>
        );
    }

    // Show error message if there was an error fetching products
    if (error) {
        return (
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Container>
        );
    }

    // Render products grid
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
            <Grid container spacing={4}>
                {products.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <Card sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 } }}>
                            <CardMedia
                                component="img"
                                alt={product.name}
                                height="200"
                                image={`http://localhost:5001/${product.image}`} // Use correct image path
                                sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
                            />
                            <CardContent sx={{ backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2, color: '#1976d2' }}>
                                    Price: ${product.price}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Company: {product.companyName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Stock: {product.stock}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleAddToCart(product)} // Pass the product to add to cart
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="secondary" 
                                        onClick={() => handlePlaceOrder(product)} // Place order handler
                                    >
                                        Place Order
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default UserHomePage;
