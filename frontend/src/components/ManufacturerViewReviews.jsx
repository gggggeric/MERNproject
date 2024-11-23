// src/ManufacturerViewReviews.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, Card, CardContent, CardMedia, CircularProgress, Alert, Box } from '@mui/material';

const ManufacturerViewReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch reviews on component mount
        const fetchReviews = async () => {
            try {
                // Get the JWT token from local storage or from wherever it's stored
                const token = localStorage.getItem('auth-token');
                
                // Send GET request to the backend route
                const response = await axios.get('http://localhost:5001/api/auth/manufacturer/reviews', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                setReviews(response.data); // Set reviews state with response data
                setLoading(false); // Set loading to false once data is fetched
            } catch (err) {
                setError('Error fetching reviews.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchReviews();
    }, []);

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />;
    }

    // Render error message if any
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    // Render a message if no reviews are found
    if (reviews.length === 0) {
        return <Typography variant="h6" color="textSecondary" align="center">No reviews found for your products.</Typography>;
    }

    // Star Rating Function
    const renderStars = (rating) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#FFD700' : '#ddd', fontSize: '20px' }}>★</span>
            );
        }
        return stars;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">Your Product Reviews</Typography>
            <List>
                {reviews.map((review) => (
                    <ListItem key={review._id} sx={{ mb: 4 }}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3 }}>
                            <CardContent>
                                {/* Product Name */}
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    {review.product.name}
                                </Typography>

                                {/* Star Rating */}
                                <Box mb={2}>
                                    {renderStars(review.rating)}
                                </Box>

                                <Typography variant="body2" color="textSecondary" paragraph>
                                    <strong>Description:</strong> {review.description}
                                </Typography>

                                {/* Review Photo */}
                                {review.photo && (
                                    <CardMedia
                                        component="img"
                                        image={review.photo}
                                        alt="Review photo"
                                        sx={{ maxWidth: 200, margin: '0 auto', borderRadius: 2 }}
                                    />
                                )}

                                <Typography variant="body2" color="textSecondary" mt={2}>
                                    <strong>Reviewed by:</strong> {review.user.email}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Reviewed on:</strong> {new Date(review.createdAt).toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ManufacturerViewReviews;
