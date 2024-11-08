const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order'); // Import Order model
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../utils/emailService'); // Import the email service
const { authenticateUser } = require('../middleware/auth');
const ManufacturerProfile = require('../models/ManufacturerProfile'); // Adjust the path as needed
const Product = require('../models/Product'); // Adjust path to your Product model
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const Cart = require('../models/Cart');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Use environment variable\
const mongoose = require('mongoose');
// Route to view orders for a user
router.get('/view/orders', authenticateUser, async (req, res) => {
    try {
      const userId = req.user._id; // Get the logged-in user's ID from the JWT token
  
      // Fetch the user's data from the database
      const user = await User.findById(userId);
      
      // Check if the user is authenticated and if their type is 'user'
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      if (user.userType !== 'user') {
        return res.status(403).json({ message: 'You are not authorized to view orders.' });
      }
  
      // Fetch the orders that belong to the authenticated user
      const orders = await Order.find({ user: userId }).populate('products.product', 'name price');
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user.' });
      }
  
      res.json(orders); // Return the orders as JSON
  
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

// POST: Submit a review for a product
// router.post('/reviews/:productId', upload.single('image'), async (req, res) => {
//     const { productId } = req.params;
//     const { rating, description } = req.body;
//     const image = req.file ? req.file.path : null;  // File path of the uploaded image

//     try {
//         const newReview = new Review({
//             product: productId,
//             user: req.user.id,  // Assuming the user is authenticated and available in req.user
//             rating,
//             description,
//             photo: image,
//         });

//         // Save the review
//         await newReview.save();

//         // Respond with success
//         res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
//     } catch (error) {
//         console.error('Error saving review:', error);
//         res.status(500).json({ message: 'Failed to submit the review' });
//     }
// });

// Endpoint to update order status
router.patch('/orders/:id/status', authenticateUser, async (req, res) => {
    const userId = req.user._id;
    const userType = req.user.userType;
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      // Ensure the user is a manufacturer
      if (userType !== 'manufacturer') {
        return res.status(403).json({ msg: 'Access denied' });
      }
  
      // Find the order by ID
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ msg: 'Order not found' });
  
      // Get IDs of products in the order
      const productIds = order.products.map(item => item.product);
  
      // Verify that each product in the order belongs to the manufacturer
      const manufacturerProducts = await Product.find({
        _id: { $in: productIds },
        user: userId,
      });
  
      if (manufacturerProducts.length === 0) {
        return res.status(403).json({ msg: 'You can only accept orders for your own products.' });
      }
  
      // Update order status
      order.orderStatus = status;
      await order.save();
  
      res.status(200).json({ msg: 'Order status updated', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  });
  


// GET all orders for a specific manufacturer
router.get('/orders', authenticateUser, async (req, res) => {
    const userId = req.user._id;
    const userType = req.user.userType;

    try {
        // Ensure the user is a manufacturer
        if (userType !== 'manufacturer') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Find products created by the manufacturer
        const manufacturerProducts = await Product.find({ user: userId }).select('_id');
        const productIds = manufacturerProducts.map(product => product._id);

        // Find orders that contain the manufacturer’s products
        const orders = await Order.find({
            'products.product': { $in: productIds }
        })
        .populate({
            path: 'products.product',
            model: 'Product',
            populate: {
                path: 'user', 
                model: 'User', 
                select: 'name email'
            }
        })
        .populate('user', 'name email'); // Populate customer info

        if (orders.length === 0) {
            return res.status(404).json({ msg: 'No orders found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});


 router.post('/order/place', authenticateUser, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log('Order data received:', req.body);  // Log the incoming order data

        const { products } = req.body;  // Get the products in the order
        const userId = req.user._id;  // Extract the user ID from the authenticated token

        console.log('User ID from token:', userId);

        if (!userId) {
            return res.status(400).json({ error: 'User not found in token.' });
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Invalid products data.' });
        }

        let totalPrice = 0;

        // Loop through the products to calculate the total price and update stock
        for (const item of products) {
            console.log(`Processing product ID: ${item.product} with quantity: ${item.quantity}`);  // Log product processing

            const product = await Product.findById(item.product).session(session);  // Find product by ID within the session
            if (!product) {
                console.error(`Product not found for ID: ${item.product}`);
                await session.abortTransaction();
                return res.status(404).json({ error: `Product not found for ID: ${item.product}` });
            }

            // Check if there is enough stock
            if (product.stock < item.quantity) {
                console.error(`Insufficient stock for ${product.name}`);
                await session.abortTransaction();
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            // Log the stock before updating
            console.log(`Product ${product.name} - Stock before update: ${product.stock}`);

            // Reduce the stock of the product by the ordered quantity
            product.stock -= item.quantity;

            // Log the stock after update
            console.log(`Product ${product.name} - Stock after update: ${product.stock}`);

            // Save the updated product stock in the database within the transaction session
            await product.save({ session });

            totalPrice += product.price * item.quantity;
        }

        // Create a new order with the user ID
        const newOrder = new Order({
            user: userId,  // Attach the user ID from the authenticated token
            products: products,
            totalPrice: totalPrice,
        });

        // Save the new order in the database within the transaction session
        await newOrder.save({ session });

        // Commit the transaction to finalize changes
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Order placed successfully!',
            order: newOrder,
        });

    } catch (error) {
        console.error('Error placing order:', error); // Log the error
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'Error placing the order. Please try again.' });
    }
});


    
    
router.get('/user/products', authenticateUser, async (req, res) => {
    try {
        // Extract pagination parameters from the query, set default values if not provided
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 products per page if not provided

        // Calculate the number of products to skip based on the current page
        const skip = (page - 1) * limit;

        // Fetch a specific number of products based on the page and limit
        const products = await Product.find()
            .skip(skip) // Skip products for previous pages
            .limit(limit); // Limit to the specified number of products

        res.status(200).json(products); // Send the fetched products as a JSON response
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Function to generate a JWT token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET, // Your secret from environment variables
        { expiresIn: '1h' } // Token expiration
    );
};
// Google login endpoint
router.post('/google/login', async (req, res) => {
    const { idToken } = req.body;

    try {
        // Verify the ID token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const userId = payload['sub'];
        const email = payload['email'];

        // Check if the user exists in your database
        let user = await User.findOne({ $or: [{ email }, { googleId: userId }] });

        if (!user) {
            // If the user doesn't exist, create a new user record
            console.log('Creating new user:', email); // Debugging statement
            user = new User({
                email,
                googleId: userId,
                status: true, // Set the status to true for new users
                userType: 'user', // Set default user type
            });
            await user.save(); // Save the new user in the database
        } else {
            // If user exists, check if the user account is active
            console.log('User found:', user.email, 'Status:', user.status); // Debugging statement
            if (!user.status) {
                return res.status(403).json({ message: 'User account is inactive. Please contact support.' });
            }
        }

        // Create a JWT token using the generateToken function
        const token = generateToken(user); // Use the defined function

        // Respond with the token and user info
        res.status(200).json({ message: 'Login successful', token, user: { email: user.email, userType: user.userType } });
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(400).json({ message: 'Google login failed', error });
    }
});

router.post('/google/register', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Use the CLIENT_ID from the .env file
        });

        const payload = ticket.getPayload();
        const userId = payload['sub']; // Google's unique ID for the user
        const email = payload['email'];

        // Check if the user already exists in your database by email or googleId
        let user = await User.findOne({ $or: [{ email }, { googleId: userId }] });

        if (!user) {
            // If the user does not exist, create a new user in your database
            user = await User.create({
                googleId: userId,
                email,
                userType: 'user', // You can set the default user type here
                status: true, // Set status to true for new users
                // Add any additional fields as needed (e.g., name, profile picture)
            });
            res.status(201).json({ message: 'User created successfully', user });
        } else {
            // If the user already exists, return a message (or handle as needed)
            res.status(200).json({ message: 'User already exists', user });
        }
    } catch (error) {
        console.error('Error during Google registration:', error);
        res.status(400).json({ message: 'Google registration failed', error });
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


router.patch('/update-password', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id; // Get the logged-in user's ID from the decoded token
        const { password } = req.body;

        // Ensure the user is of type 'user'
        if (req.user.userType !== 'user') {
            return res.status(403).json({ error: 'Only users with userType "user" can update their password.' });
        }

        // Validate password
        if (!password) {
            return res.status(400).json({ error: 'Password is required.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Find the user and update the password
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});



router.post('/register', upload.single('profileImage'), async (req, res) => {
    const { email, password, userType = 'user' } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Registration attempt:', { email, userType });

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Handle profile image upload (if any)
        const profileImagePath = req.file ? `uploads/${req.file.filename}` : null;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a confirmation token (using crypto for better security)
        const crypto = require('crypto');
        const confirmationToken = crypto.randomBytes(32).toString('hex');

        // Create the new user
        const newUser = new User({
            email,
            password: hashedPassword,
            userType,
            status: false, // Indicating the user is not confirmed yet
            confirmationToken, // Confirmation token
            profileImage: profileImagePath // Save image path if available
        });

        // Save user to the database
        await newUser.save();

        // Send confirmation email (assuming the function is defined)
        await sendConfirmationEmail(email, confirmationToken);

        // Send success response
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
router.get('/user/profile', authenticateUser, async (req, res) => {
    try {
        // Fetch user data from the database based on the decoded token user ID
        const user = await User.findById(req.user._id);  // Use req.user._id here as well

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If there's a profile image, prepend the server's base URL
        const profileImageUrl = user.profileImage ? `http://localhost:5001/${user.profileImage}` : null;

        // Send back user profile information
        res.json({
            name: user.name,
            email: user.email,
            profileImage: profileImageUrl,  // Include the full URL to the profile image
        });
    } catch (err) {
        console.error('Error fetching user profile:', err); // Log any server error
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/user/password', authenticateUser, upload.single('profileImage'), async (req, res) => {
    try {
        const { oldPassword, password } = req.body;

        // Find user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Password update logic
        if (user.password && oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password' });
            }
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Update profile image if a new one is provided
        if (req.file) {
            user.profileImage = `uploads/${req.file.filename}`; // Save file path in DB
        }

        await user.save();
        res.json({ message: 'Profile updated successfully!' });
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
