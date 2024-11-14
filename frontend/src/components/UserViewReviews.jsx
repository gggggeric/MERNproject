import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserViewReviews.css';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for async operations
  const token = localStorage.getItem('auth-token'); // JWT token from localStorage

  useEffect(() => {
    const fetchReviews = async () => {
      try {
     const response =    await axios.get('http://localhost:5001/api/auth/user/reviews', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setReviews(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching reviews');
      }
    };

    fetchReviews();
  }, [token]);

  // Function to handle rating update
  const handleRatingChange = async (reviewId, newRating) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5001/api/auth/user/review/${reviewId}`,
        { rating: newRating },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // Update reviews state with the updated rating
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, rating: newRating } : review
        )
      );
      setLoading(false);
    } catch (err) {
      setError('Error updating rating');
      setLoading(false);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!reviews.length) {
    return (
      <div className="empty-state">
        <p>No reviews found. Submit a review first!</p>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h2 className="reviews-title">Your Reviews</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <h3 className="product-name">{review.product.name}</h3>
            {/* Display image if available */}
            {review.photo ? (
            <img
            src={review.photo} // Directly use the Cloudinary URL
            alt={review.product.name}
            className="review-image"
          />
          
            ) : (
              <p>No image available</p>
            )}
            <p className="review-description">{review.description}</p>

            {/* Display Rating and allow update */}
            <div className="rating-container">
              <label htmlFor="rating">Rating: </label>
              <select
                id="rating"
                value={review.rating}
                onChange={(e) => handleRatingChange(review._id, parseInt(e.target.value))}
                disabled={loading} // Disable while loading
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} ⭐
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;