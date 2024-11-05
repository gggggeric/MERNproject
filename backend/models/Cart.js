// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to the Product model
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            required: true
        },
        image: {
            type: String, // Assuming the image is stored as a string (URL or path)
            required: true // Set this to true if you want to make it mandatory
        }
    }],
}, {
    timestamps: true // Automatically create createdAt and updatedAt fields
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
