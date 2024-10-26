// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Adjust path to your Product model

// GET all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetches all products from MongoDB
        res.json(products);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
