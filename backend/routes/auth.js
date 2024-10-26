const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../utils/emailService'); // Import the email service
const { authenticateUser } = require('../middleware/auth');
const ManufacturerProfile = require('../models/ManufacturerProfile'); // Adjust the path as needed
const Product = require('../models/Product'); // Adjust path to your Product model
const multer = require('multer');
const SellerProfile = require('../models/SellerProfile'); // Adjust path if necessary

// POST Create Seller Profile
router.post('/sellerProfile', authenticateUser, async (req, res) => {
    try {
        const { storeName, address, contactNo } = req.body;
        const user = await User.findById(req.user._id); // Fetch the authenticated user

        // Check if user is a seller
        if (user.userType !== 'seller') {
            return res.status(403).json({ message: 'Unauthorized: Only sellers can create a profile' });
        }

        // Check if the seller profile already exists
        const existingProfile = await SellerProfile.findOne({ user: user._id });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        // Create a new seller profile
        const newProfile = new SellerProfile({
            user: user._id,
            storeName,
            address,
            contactNo,
        });

        await newProfile.save();
        res.status(201).json({ message: 'Profile created successfully!', profile: newProfile });
    } catch (error) {
        console.error('Error creating seller profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET Seller Profile
router.get('/sellerProfile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Fetch the authenticated user

        // Check if user is a seller
        if (user.userType !== 'seller') {
            return res.status(403).json({ message: 'Unauthorized: Only sellers can access this profile' });
        }

        // Find the seller profile associated with this user and populate the user data
        const profile = await SellerProfile.findOne({ user: user._id }).populate('user');

        if (!profile) {
            return res.status(404).json({ message: 'Seller profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error retrieving seller profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});


const upload = multer({ storage });

router.post('/register', async (req, res) => {
    const { email, password, userType = 'user' } = req.body;
    console.log('Registration attempt:', { email, userType });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const confirmationToken = Math.random().toString(36).substr(2); // Generate a random confirmation token

        const newUser = new User({
            email,
            password: hashedPassword,
            userType,
            status: false, // Set to false to indicate the user is not yet confirmed
            confirmationToken // Store the confirmation token
        });

        await newUser.save();

        // Send confirmation email
        await sendConfirmationEmail(email, confirmationToken);

        res.status(201).json({ message: 'User registered successfully! Please check your email to confirm.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed!', error: error.message });
    }
});

router.get('/manufacturer-profile/me', authenticateUser, async (req, res) => {
    try {
        const manufacturerProfile = await ManufacturerProfile.findOne({ user: req.user._id }); // Change to _id if necessary
        if (!manufacturerProfile) {
            return res.status(404).json({ msg: 'Manufacturer profile not found' });
        }
        return res.status(200).json(manufacturerProfile);
    } catch (error) {
        console.error('Error retrieving manufacturer profile:', error.message);
        return res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});
router.get('/products', authenticateUser, async (req, res) => {
    const userId = req.user._id; // Get the authenticated user's ID

    console.log('Authenticated User ID:', userId); // Log the user ID

    try {
        const products = await Product.find({ user: userId }); // Fetch products by user ID
        console.log('Fetched Products:', products); // Log fetched products

        if (products.length === 0) {
            return res.status(404).json({ msg: 'No products found' });
        }

        res.status(200).json(products); // Return the products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});



router.get('/test-auth', authenticateUser, (req, res) => {
    re.json({ authenticatedUser: req.user });
});
router.delete('/product/:id', authenticateUser, async (req, res) => {
    const productId = req.params.id; // Get the product ID from the route parameter
    const userId = req.user._id; // Get user ID from authenticated request
    console.log('Product ID:', productId);
    console.log('User ID:', userId);
    try {
        // Fetch the product from the database
        const product = await Product.findById(productId);

        // Ensure product exists
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check if the authenticated user is the owner of the product
        if (product.user.toString() !== userId.toString()) {
            return res.status(403).json({ msg: 'Forbidden: You are not allowed to delete this product' });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);

        return res.status(200).json({ msg: 'Product deleted successfully!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

router.post('/product/create', authenticateUser, upload.single('image'), async (req, res) => {
    const { name, description, price, stock } = req.body;
    const userId = req.user._id; // Get user ID from authenticated request

    console.log('Request Body:', req.body);
    console.log('Authenticated User ID:', userId);

    try {
        // Fetch the user
        const user = await User.findById(userId);

        // Ensure user exists
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('User Type:', user.userType);

        // Check if the user type is 'manufacturer'
        if (user.userType !== 'manufacturer') {
            return res.status(403).json({ msg: 'Forbidden: Only manufacturers can create products' });
        }

        // Validate product data
        if (!name || !description || !price || !stock) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Fetch the manufacturer profile to get the company name
        const manufacturerProfile = await ManufacturerProfile.findOne({ user: userId });

        // Ensure manufacturer profile exists
        if (!manufacturerProfile) {
            return res.status(404).json({ msg: 'Manufacturer profile not found' });
        }

        // Log the company name being stored
        const companyName = manufacturerProfile.companyName;
        console.log('Company Name:', companyName);

        // Create new product
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            user: userId, // Connect the product to the user
            companyName, // Store company name in the product
            image: req.file ? req.file.path : null, // Save the image path from multer, if provided
        });

        // Log the product details being saved
        console.log('Saving Product:', {
            name,
            description,
            price,
            stock,
            user: userId,
            companyName, // Log company name being saved with the product
            image: newProduct.image,
        });

        // Save product to database
        const product = await newProduct.save();

        // Respond with the created product and company name
        return res.status(201).json({
            success: true,
            product,
            companyName, // Include company name in the response
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
});


router.get('/products', authenticateUser, async (req, res) => {
    const userId = req.user._id; // Get the authenticated user's ID

    console.log('Authenticated User ID:', userId); // Log the user ID

    try {
        const products = await Product.find({ user: userId }); // Fetch products by user ID
        console.log('Fetched Products:', products); // Log fetched products

        if (products.length === 0) {
            return res.status(404).json({ msg: 'No products found' });
        }

        res.status(200).json(products); // Return the products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});
router.get('/product/:id', authenticateUser, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json({ product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});
router.put('/product/edit/:id', authenticateUser, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const productId = req.params.id;

        console.log('Incoming data:', req.body);
        console.log('Updating product ID:', productId);

        // Prepare the update object
        const updateData = { name, description, price, stock };

        // If there's an image, include it in the update
        if (req.file) {
            updateData.image = req.file.path; // Store the path or filename as needed
        }

        // Find and update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true } // This option returns the updated document
        );

        // Check if product was found and updated
        if (!updatedProduct) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        console.log('Updated Product:', updatedProduct);
        res.json({ msg: 'Product updated successfully!', product: updatedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

//products

router.post('/manufacturerProfile', authenticateUser, async (req, res) => {
    try {
        const { companyName, address, contactNumber } = req.body;
        const user = await User.findById(req.user._id); // Ensure you are fetching the user correctly

        // Check if user is a manufacturer
        if (user.userType !== 'manufacturer') {
            return res.status(403).json({ message: 'Unauthorized: Only manufacturers can create a profile' });
        }

        // Create a new manufacturer profile
        const newProfile = new ManufacturerProfile({
            user: user._id,
            companyName,
            address,
            contactNumber,
        });

        await newProfile.save();
        res.status(201).json({ message: 'Profile created successfully!' });
    } catch (error) {
        console.error('Error creating manufacturer profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/manufacturerProfile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('manufacturerProfile'); // Ensure you are fetching the user correctly and populate if necessary

        // Check if user is a manufacturer
        if (user.userType !== 'manufacturer') {
            return res.status(403).json({ message: 'Unauthorized: Only manufacturers can access this profile' });
        }

        // Find the manufacturer profile
        const profile = await ManufacturerProfile.findOne({ user: user._id });

        if (!profile) {
            return res.status(404).json({ message: 'Manufacturer profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error retrieving manufacturer profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// Update password route
router.put('/user/password', authenticateUser, async (req, res) => {
    console.log('Updating password for user:', req.user._id); // req.user is populated by middleware
    try {
        const { oldPassword, password } = req.body;

        // Find user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the old password matches the one in the database
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();
        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



// Update password route for seller
router.put('/seller/password', authenticateUser, async (req, res) => {
    console.log('Updating password for seller:', req.user._id); // req.user is populated by middleware
    try {
        const { oldPassword, password } = req.body;

        // Find user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the userType is seller
        if (user.userType !== 'seller') {
            return res.status(403).json({ message: 'Unauthorized: Only sellers can update their password' });
        }

        // Check if the old password matches the one in the database
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();
        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//update password for manufacturer
router.put('/manufacturer/password', authenticateUser, async (req, res) => {
    console.log('Updating password for manufacturer:', req.user._id); // req.user is populated by middleware
    try {
        const { oldPassword, password } = req.body;

        // Find user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the userType is seller
        if (user.userType !== 'manufacturer') {
            return res.status(403).json({ message: 'Unauthorized: Only sellers can update their password' });
        }

        // Check if the old password matches the one in the database
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();
        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});




// Email confirmation route
router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Find the user with the confirmation token
        const user = await User.findOne({ confirmationToken: token });

        if (!user) {
            return res.status(404).json({ message: 'Invalid confirmation token' });
        }

        // Update the user's status and clear the confirmation token
        user.status = true; // Activate the user
        user.confirmationToken = null; // Clear the token after confirmation
        await user.save();

        res.status(200).json({ message: 'Email confirmed successfully!' });
    } catch (error) {
        console.error('Email confirmation error:', error);
        res.status(500).json({ message: 'Email confirmation failed', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json('User not found!');

        // Check if user is inactive
        if (!user.status) return res.status(403).json('Account is inactive. Contact support.');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json('Wrong password!');

        const token = jwt.sign({ _id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.header('auth-token', token).json({ token, userType: user.userType, message: 'Login successful!' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json(err);
    }
});
// Fetch all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users); // Send the users as a JSON response
    } catch (error) {
        console.error('Error fetching users:', error); // Log any errors
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Delete a user by ID
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete user with ID: ${id}`);

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (edit userType and status)
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { userType, status } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, // the user ID
            { userType, status }, // fields to update
            { new: true } // return the updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser); // send back the updated user
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
