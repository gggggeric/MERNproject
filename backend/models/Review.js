const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to Product model
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    photo: {
        type: String, // URL or file path for the uploaded photo
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5, // Ratings are typically between 1 and 5
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure the model is registered correctly
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
