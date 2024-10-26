const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    contactNo: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResellProduct' }] // Optional: Array of product IDs
});

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);
