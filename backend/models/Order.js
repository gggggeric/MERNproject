const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
    },
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
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    storeName: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
});

OrderSchema.pre('save', function (next) {
    // Calculate total price based on price and quantity before saving
    this.totalPrice = this.price * this.quantity;
    next();
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
