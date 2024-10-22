// controllers/userController.js
const User = require('../models/User'); // Import your User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new user
const createUser = async (req, res) => {
    const { email, password, userType } = req.body; // Extract data from the request body

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            email,
            password: hashedPassword, // Use the hashed password
            userType,
            isActive: true // Assuming you have an 'isActive' field in your User model
        });

        await newUser.save(); // Save the user to the database
        res.status(201).json({ 
            _id: newUser._id, 
            email: newUser.email, 
            userType: newUser.userType 
        }); // Return the created user (excluding the password)
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ message: 'Error creating user' });
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createUser, deleteUser, getAllUsers };
