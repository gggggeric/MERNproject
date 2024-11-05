import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, CircularProgress, Paper, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserHomePage = () => {
    const [products, setProducts] = useState([]); // State to hold products
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [error, setError] = useState(null); // State to manage errors
    const userEmail = localStorage.getItem('user-email'); // Retrieve user's email from local storage
    const userId = localStorage.getItem('user-id'); // Retrieve user's ID from local storage
    const navigate = useNavigate(); // Hook for navigation

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

    // Function to handle placing an order (to be implemented)
    const handlePlaceOrder = (product) => {
        console.log('Place order for:', product);
        // Implement your place order logic here
    };

    // Function to handle adding a product to the cart
    const handleAddToCart = async (product) => {
        const quantity = prompt('Enter quantity:', '1'); // Prompt for quantity
        if (quantity && !isNaN(quantity) && quantity > 0) { // Validate quantity
            try {
                const token = localStorage.getItem('auth-token'); // Retrieve the JWT token
                const userId = localStorage.getItem('user-id'); // Retrieve user ID
    
                // Make POST request to add item to cart
                const response = await axios.post('http://localhost:5001/api/auth/user/add-to-cart', {
                    productId: product._id,
                    quantity: parseInt(quantity), // Convert quantity to integer
                    image: product.image,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in the request headers
                    }
                });
    
                console.log('Add to cart response:', response.data); // Log response data
                navigate('/cart'); // Redirect to cart page after adding to cart
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Failed to add item to cart.'); // Alert on error
            }
        } else {
            alert('Please enter a valid quantity.'); // Alert on invalid quantity
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
                                        onClick={() => handleAddToCart(product)} // Add to cart handler
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
