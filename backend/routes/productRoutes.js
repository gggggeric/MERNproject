const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Adjust path to your Product model
const ResellProduct = require('../models/ResellProducts');
const SellerProfile = require('../models/SellerProfile'); // Adjust path to your SellerProfile model
const { authenticateUser } = require('../middleware/auth'); // Ensure you have an authentication middleware
const ManufacturerProfile = require('../models/ManufacturerProfile'); // Adjust the path as necessary

router.get('/resold-products', authenticateUser, async (req, res) => {
    try {
        const baseUrl = 'http://localhost:5001/uploads/'; // Adjust this based on your production setup
        const resoldProducts = await ResellProduct.find();

        // Map through products to include the image path
        const responseProducts = resoldProducts.map(product => ({
            id: product._id,
            sellerProfile: product.sellerProfile,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            image: product.image ? baseUrl + product.image.replace(/\\/g, '/') : `${baseUrl}default.jpg`, // Handle image paths
            createdAt: product.createdAt,
        }));

        console.log('Fetched Resold Products:', responseProducts);
        res.json(responseProducts);
    } catch (error) {
        console.error('Error fetching resold products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/products', authenticateUser, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// POST to re-sell a product
router.post('/resellProducts', authenticateUser, async (req, res) => {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid Product ID and quantity are required.' });
    }

    try {
        // Fetch the product to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Check if the requested quantity is available
        if (quantity > product.stock) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }

        // Create a new resell product entry
        const newResellProduct = new ResellProduct({
            sellerProfile: req.user._id, // Assuming req.user contains the seller's information
            productId, // Storing product ID for reference
            name: product.name,
            description: product.description,
            price: product.price,
            quantity, // Quantity from the modal
            image: product.image // Copy the image from the original product
        });

        // Save the new resell product
        await newResellProduct.save();

        // Update the original product's stock
        product.stock -= quantity;
        await product.save();

        res.status(201).json({ message: 'Product re-sold successfully!', product: newResellProduct });
    } catch (error) {
        console.error('Error re-selling product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;
