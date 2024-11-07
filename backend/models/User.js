const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Password can be optional for Google users
    googleId: { type: String, unique: true }, // New field for Google users
    userType: { 
        type: String, 
        enum: ['user', 'admin', 'manufacturer'], 
        default: 'user' 
    },
    status: { type: Boolean, default: false }, // Indicates if the user is confirmed
    confirmationToken: { type: String }, // Token for email confirmation
    manufacturerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturerProfile' }, // Reference to ManufacturerProfile
    profileImage: { type: String, default: '' }// This will store the path or URL of the profile image
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
