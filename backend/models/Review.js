// models/Review.js
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

// Update the product's average rating based on reviews
reviewSchema.statics.calculateAverageRating = async function(productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
    ]);

    try {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: result.length ? result[0].avgRating : 0
        });
    } catch (error) {
        console.error("Error updating product's average rating:", error);
    }
};

// Update average rating after saving or removing a review
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post('remove', function() {
    this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
