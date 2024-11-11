const mongoose = require('mongoose');

// Define the schema for an order
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a 'User' model for users
        required: true
    },
    products: [
        {
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', // Assuming you have a 'Product' model for products
                required: true // Add required for product as it's important
            },
            quantity: { 
                type: Number, 
                required: true,
                min: 1 // Ensure quantity is at least 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Accepted'], // Limit to specific statuses
        default: 'Pending' // Set default status to 'Pending'
    },
    shippedToAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'G-cash', 'Bank Transfer', 'Cash On Delivery'], // Example payment methods
        required: true
    },
    shippingMethod: {
        type: String,
        enum: ['Lalamove', 'Grab', 'Ali-Express'], // Example shipping methods
        required: true // Set required to true
    },
    shippingStatus: {
        type: String,
        enum: ['Pending', 'Delivered'], // Example statuses
        default: 'Pending' // Default to 'Pending'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
