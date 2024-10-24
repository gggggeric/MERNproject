// models/ManufacturerProfile.js
const mongoose = require('mongoose');

const ManufacturerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ensure this matches your User model name
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
});

const ManufacturerProfile = mongoose.model('ManufacturerProfile', ManufacturerProfileSchema);
module.exports = ManufacturerProfile;
