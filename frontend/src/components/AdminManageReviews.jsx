import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Button, Typography, Grid, CircularProgress } from '@mui/material';
import ReactStars from 'react-stars'; // Import react-stars for displaying the rating as stars

const AdminManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch reviews when the component mounts
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/auth/reviews', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                setReviews(response.data.reviews);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Function to delete a review
    const handleDeleteReview = async (reviewId) => {
        try {
            await axios.delete(`http://localhost:5001/api/auth/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
                },
            });
            setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Failed to delete review');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error" align="center">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Manage Reviews
            </Typography>

            <Grid container spacing={3} justifyContent="center">
                {reviews.length === 0 ? (
                    <Typography variant="h6" align="center" color="textSecondary">
                        No reviews available.
                    </Typography>
                ) : (
                    reviews.map((review) => (
                        <Grid item xs={12} sm={6} md={4} key={review._id}>
                            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        Product: {review.product?.name || 'Unknown'}
                                    </Typography>
                                    
                                    {/* Rating as stars */}
                                    <ReactStars 
                                        count={5}
                                        value={review.rating}
                                        size={24}
                                        edit={false}
                                        color2={'#ffd700'} // Gold color for filled stars
                                        color1={'#e4e5e9'} // Grey color for empty stars
                                    />

                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                        Rating: {review.rating} / 5
                                    </Typography>
                                    <Typography variant="body2" sx={{ marginBottom: 2 }}>
                                        {review.description}
                                    </Typography>
                                    
                                    {/* Update review photo path */}
                                    {review.photo && (
                                         <img
                                         src={review.photo} // Directly use the Cloudinary URL
                                         alt={review.product.name}
                                         className="review-image"
                                       />
                                    )}
                                    
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteReview(review._id)}
                                            sx={{
                                                textTransform: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default AdminManageReviews;
