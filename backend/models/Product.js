const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    averageRating: {
        type: Number,
        default: 0, // Initialize with 0 to avoid undefined issues
    },
    totalRatings: {
        type: Number,
        default: 0, // Track the total number of reviews for the product
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: String, // You can also use [String] for multiple categories
        required: true,
    },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
