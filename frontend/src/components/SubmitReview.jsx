import React, { useState } from 'react';
import axios from 'axios';

const SubmitReview = ({ productId }) => {
    const [rating, setRating] = useState(1);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null); // Keep it as a File object
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Get token from localStorage
            const token = localStorage.getItem('auth-token');

            // Create FormData to send the data as multipart/form-data
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('description', description);
            if (image) {
                formData.append('image', image); // Only append image if there is one
            }

            // Make API request to submit review
            const response = await axios.post(
                `http://localhost:5001/api/reviews/${productId}`, // Correct API endpoint
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data', // Set proper content type for file upload
                    },
                }
            );
            setMessage('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage('Failed to submit review.');
        }
    };

    return (
        <div>
            <h3>Submit Review</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Rating (1-5):</label>
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        min="1"
                        max="5"
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Upload Photo:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit">Submit Review</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SubmitReview;
