const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    contactNo: { type: String, required: true }, // Ensure `contactNo` is used here
});

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);
