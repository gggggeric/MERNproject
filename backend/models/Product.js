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
    manufacturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ManufacturerProfile', // Reference to ManufacturerProfile model
        required: true,
    },
    image: {
        type: String, // This will store the image URL or file path
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
