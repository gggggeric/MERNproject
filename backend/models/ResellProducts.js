const mongoose = require('mongoose');

const ResellProductSchema = new mongoose.Schema({
    sellerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true }, // Reference to SellerProfile
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }, // Optional: to track when the product was added
});

module.exports = mongoose.model('ResellProduct', ResellProductSchema);
