import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, Card, CardContent, CardMedia, CircularProgress, Alert, Box, Grid, Paper } from '@mui/material';

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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>
                Your Product Reviews
            </Typography>
            <Grid container spacing={4}>
                {reviews.map((review) => (
                    <Grid item xs={12} md={6} key={review._id}>
                        <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', boxShadow: 2, height: '100%' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Product Name */}
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
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
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ManufacturerViewReviews;
