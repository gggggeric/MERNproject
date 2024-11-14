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
const Review = require('../models/Review');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Use environment variable\
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Use cloud name from .env
    api_key: process.env.CLOUDINARY_API_KEY,      // Use API key from .env
    api_secret: process.env.CLOUDINARY_API_SECRET // Use API secret from .env
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,  // Pass the configured Cloudinary instance
    params: {
        folder: 'uploads',          // Folder in Cloudinary where images will be saved
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],  // Allowed image formats
        transformation: [{         // Optional: Apply transformations (resize, crop, etc.)
            width: 500,
            height: 500,
            crop: 'limit',
        }]
    }
});
const upload = multer({ storage });

// Route to mark an order as delivered
router.patch('/mark-delivered/:orderId', authenticateUser, async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id; // Assuming user ID is available in req.user after JWT verification
  
    try {
        // Find the order by its ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the authenticated user is the same as the order's user
        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to mark this order as delivered' });
        }

        // Only update the shippingStatus to 'Delivered'
        order.shippingStatus = 'Delivered';

        await order.save();

        // Return a success response
        res.status(200).json({ message: 'Order marked as delivered', order });
    } catch (err) {
        console.error('Error marking order as delivered:', err);
        res.status(500).json({ message: 'An error occurred while marking the order as delivered' });
    }
});

  
  

router.post('/create', authenticateUser, async (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied. You are not an admin.' });
    }

    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
        return res.status(400).json({ message: 'Email, password, and userType are required.' });
    }

    try {
        // Hash the password before saving
        const hashedPassword = bcrypt.hashSync(password, 10); // Hash with 10 rounds

        // Create a new user with the hashed password, userType, and status set to true
        const newUser = new User({
            email,
            password: hashedPassword,  // Use the hashed password
            userType,
            status: true // Set status to true
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating user.' });
    }
});
// Route to fetch all reviews for admins
router.get('/reviews', authenticateUser, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Forbidden! Only admins can view reviews.' });
        }

        // Fetch all reviews, you can also populate product and user if you need more details
        const reviews = await Review.find()
            .populate('product', 'name')  // Populate the product name, adjust fields as needed
            .populate('user', 'name email');  // Populate the user info, adjust as necessary

        res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


// Route to delete a single review (only for admin)
router.delete('/reviews/:reviewId', authenticateUser, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Forbidden! Only admins can delete reviews.' });
        }

        const { reviewId } = req.params;

        // Find the review by its ID
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Perform the delete operation
        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});




router.delete('/products/bulk-delete', authenticateUser, async (req, res) => {
    try {
        // Check if the user is a manufacturer
        if (req.user.userType !== 'manufacturer') {
            return res.status(403).json({ message: 'Forbidden! Only manufacturers can delete products.' });
        }

        const productIds = req.body.productIds;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'Product IDs must be an array and cannot be empty' });
        }

        // Ensure that the user is the owner of the products they want to delete
        const products = await Product.find({ 
            _id: { $in: productIds },
            user: req.user._id // Ensure the product belongs to the authenticated user
        });

        if (products.length !== productIds.length) {
            return res.status(403).json({ message: 'You can only delete your own products.' });
        }

        // Perform the bulk delete operation
        const result = await Product.deleteMany({
            _id: { $in: productIds },
            user: req.user._id // Ensure the product belongs to the authenticated user
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No products found with the given IDs' });
        }

        res.status(200).json({ message: `${result.deletedCount} products deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});













router.get('/sales/monthly', authenticateUser, async (req, res) => {
    const userId = req.user._id; // Get the logged-in user's ID
    console.log('Logged-in manufacturer userId:', userId);

    // Check if the user is a manufacturer
    if (req.user.userType !== 'manufacturer') {
        return res.status(403).json({ message: 'Forbidden! You must be a manufacturer to access this resource.' });
    }

    try {
        // Aggregation query to get monthly sales for the manufacturer
        const salesData = await Order.aggregate([
            // Match only "Accepted" orders
            { 
                $match: { 
                    orderStatus: 'Accepted' 
                }
            },
            {
                // Unwind the products array to process each product individually
                $unwind: "$products"
            },
            {
                // Lookup the product details and check who made the product (the manufacturer)
                $lookup: {
                    from: "products", // Referencing the "Product" collection
                    localField: "products.product", // Product field in orders
                    foreignField: "_id", // _id field in the product collection
                    as: "productDetails" // Store the result as productDetails in the order
                }
            },
            {
                // Unwind the productDetails array so that we can filter based on the manufacturer
                $unwind: "$productDetails"
            },
            {
                // Filter by matching the manufacturer (user) who created the product
                $match: {
                    "productDetails.user": new mongoose.Types.ObjectId(userId) // Ensure the userId is converted to ObjectId correctly
                }
            },
            {
                // Group by the month and sum the totalPrice for each month
                $group: {
                    _id: { $month: "$createdAt" }, // Group by month
                    totalSales: { $sum: "$totalPrice" } // Sum the totalPrice for each month
                }
            },
            {
                // Sort by month in ascending order
                $sort: { _id: 1 }
            }
        ]);

        // Create a map to store sales data per month
        const salesMap = {};
        salesData.forEach(data => {
            // Map the total sales to the month
            salesMap[data._id] = data.totalSales;
        });

        // Array of month names for January to December
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Initialize an array for all months (1 to 12), ensuring that each month is represented
        const allMonthsData = [];
        for (let month = 1; month <= 12; month++) {
            allMonthsData.push({
                month: monthNames[month - 1], // Get the month name
                totalSales: salesMap[month] || 0 // If no sales for this month, set totalSales to 0
            });
        }

        // Log the sales data to check if it's mapped correctly
        console.log('Sales Data:', allMonthsData);

        // Send the data to the frontend
        res.json(allMonthsData);
    } catch (err) {
        console.error('Error fetching sales data:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// PUT route to update the rating of a review
router.put('/user/review/:reviewId', authenticateUser, async (req, res) => {
    const { reviewId } = req.params;
    const { rating } = req.body;
  
    try {
      // Check if the review exists in the database
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Fetch the user who is trying to update the review
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user's userType is 'user'
      if (user.userType !== 'user') {
        return res.status(403).json({ message: 'Only users with userType "user" can update the review rating' });
      }
  
      // Ensure that the user is the one who created the review
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to edit this review' });
      }
  
      // Update the rating
      review.rating = rating;
  
      // Save the updated review
      await review.save();
  
      res.json(review); // Return the updated review
    } catch (err) {
      console.error('Error updating rating:', err); // Log any error
      res.status(500).json({ message: 'Error updating review rating' });
    }
  });
  
router.get('/user/reviews', authenticateUser, async (req, res) => {
    try {
      // Check if the user type is 'user'
      if (req.user.userType !== 'user') {
        return res.status(403).json({ message: 'Access forbidden: Only regular users can view their reviews' });
      }
  
      const userId = req.user._id; // Accessing the user ID from the decoded JWT payload
      const reviews = await Review.find({ user: userId }).populate('product'); // Populate to get product details
  
      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found' });
      }
  
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error); // Log any errors
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });
  
// Review submission route with Cloudinary integration
router.post('/submit-review', authenticateUser, upload.single('image'), async (req, res) => {
    const { productId, rating, description } = req.body; // Get review data from request body
    const userId = req.user._id;  // Get userId from JWT token
    const image = req.file;  // Retrieve uploaded image if exists

    try {
        // Check if the user is allowed to submit a review (userType = 'user')
        if (req.user.userType !== 'user') {
            return res.status(403).json({ message: 'Only users are allowed to submit reviews.' });
        }

        // Validate review data
        if (!productId || !rating || !description) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find the product by productId
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        // Upload image to Cloudinary if an image file is provided
        let imageUrl = null;
        if (image) {
            // Cloudinary upload URL will be set automatically by the multer-storage-cloudinary
            imageUrl = image.path; // The path provided by Cloudinary after uploading
        }

        // Create a new review with the Cloudinary image URL if available
        const newReview = new Review({
            user: userId,
            product: productId,
            rating,
            description,
            photo: imageUrl, // Store the Cloudinary image URL
        });

        // Save the review to the database
        await newReview.save();

        // Update the product's rating information
        const reviews = await Review.find({ product: productId });
        const totalRatings = reviews.length;
        const sumOfRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = sumOfRatings / totalRatings;

        // Update the product's average rating and total ratings count
        await Product.findByIdAndUpdate(productId, {
            averageRating,
            totalRatings,
        });

        res.status(201).json({ message: 'Review submitted successfully!' });

    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to view orders for a user with review status check and shipping address
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

        // Fetch the orders that belong to the authenticated user and populate product details
        const orders = await Order.find({ user: userId }).populate('products.product', 'name price');

        // If no orders found, return a message
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }

        // Add reviewExists status for each product in each order and include shipping address
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const productsWithReviewStatus = await Promise.all(
                    order.products.map(async (item) => {
                        const reviewExists = await Review.exists({
                            product: item.product._id,
                            user: userId
                        });
                        return {
                            ...item.toObject(),
                            reviewExists // Add review existence status for each product
                        };
                    })
                );

                // Ensure shippingAddress is included, even if it's missing
                const shippingAddress = order.shippingAddress || {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: ''
                };

                return {
                    ...order.toObject(),
                    products: productsWithReviewStatus,
                    shippingAddress // Add shipping address details
                };
            })
        );

        res.json(ordersWithDetails); // Return the orders with review status and shipping address as JSON

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

  

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

        const { products, paymentMethod, shippingMethod, shippingStatus } = req.body;  // Get products, paymentMethod, shippingMethod, and shippingStatus
        const userId = req.user._id;  // Extract the user ID from the authenticated token

        console.log('User ID from token:', userId);

        if (!userId) {
            return res.status(400).json({ error: 'User not found in token.' });
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Invalid products data.' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method is required.' });
        }

        if (!shippingMethod) {
            return res.status(400).json({ error: 'Shipping method is required.' });
        }

        // Fetch the user to get the shipping address
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const { address } = user;  // Get the address from the User model

        if (!address) {
            return res.status(400).json({ error: 'Address is missing. Please configure it in your profile.' });
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

        // Create a new order with the user ID, address, paymentMethod, shippingMethod, and shippingStatus
        const newOrder = new Order({
            user: userId,  // Attach the user ID from the authenticated token
            products: products,
            totalPrice: totalPrice,
            shippedToAddress: address,  // Assign the address from the User model
            paymentMethod: paymentMethod,  // Capture the payment method from the form
            shippingMethod: shippingMethod,  // Capture the shipping method
            orderStatus: 'Pending',  // Ensure order status is 'Pending' by default
            shippingStatus: shippingStatus || 'Pending',  // Default to 'Pending' if no status is provided
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
        const limit = parseInt(req.query.limit) || 9;  // Default to 10 products per page if not provided

        // Extract the rating filter from the query (0 means no filter)
        const ratingFilter = parseInt(req.query.rating) || 0;  // Default to 0 (no rating filter)

        // Extract the category filter from the query (empty means no filter)
        const categoryFilter = req.query.category || '';  // Default to empty string (no category filter)

        // Extract price range filters from the query (min and max prices)
        const minPrice = parseFloat(req.query.minPrice) || 0; // Default to 0 if not provided
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE; // Default to max value if not provided

        // Calculate the number of products to skip based on the current page
        const skip = (page - 1) * limit;

        // Build the query object for filtering
        let filter = {};

        // Apply the rating filter if greater than 0
        if (ratingFilter > 0) {
            filter.averageRating = { $gte: ratingFilter }; // Filter products with average rating greater than or equal to the rating filter
        }

        // Apply the category filter if not empty
        if (categoryFilter) {
            filter.category = categoryFilter; // Filter products based on the category
        }

        // Apply the price filter (between minPrice and maxPrice)
        filter.price = { $gte: minPrice, $lte: maxPrice };

        // Fetch products based on the page, limit, and filters
        const products = await Product.find(filter) // Apply the filter
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
        { userId: user._id, email: user.email, userType: user.userType },  // Include userType here
        process.env.JWT_SECRET,  // Your secret from environment variables
        { expiresIn: '1h' }  // Token expiration
    );
};
// Google login endpoint
router.post('/google/login', async (req, res) => {
    console.log(req.body); // Check if the idToken is received correctly
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

        // Generate the JWT token using the generateToken function
        const token = generateToken(user);  // Use the defined function

        // Send the token in the response header and response body, similar to normal login route
        res.header('auth-token', token).json({
            token,  // Send the token
            userType: user.userType,  // Send userType as part of the response
            message: 'Login successful!' // Message to confirm login
        });
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
        const profileImagePath = req.file ? req.file.path : null; // Get Cloudinary URL if the image is uploaded

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
            profileImage: profileImagePath // Save Cloudinary image URL (if available)
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
// POST route to create a product
router.post('/product/create', authenticateUser, upload.array('images', 5), async (req, res) => {
    const { name, description, price, stock, category } = req.body;
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
        if (!name || !description || !price || !stock || !category) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Fetch the manufacturer profile to get the company name
        const manufacturerProfile = await ManufacturerProfile.findOne({ user: userId });

        // Ensure manufacturer profile exists
        if (!manufacturerProfile) {
            return res.status(404).json({ msg: 'Manufacturer profile not found' });
        }

        const companyName = manufacturerProfile.companyName;
        console.log('Company Name:', companyName);

        // Prepare an array of image URLs
        let imageUrls = [];

        // Upload images to Cloudinary
        if (req.files) {
            for (let file of req.files) {
                const uploadResponse = await cloudinary.uploader.upload(file.path);
                imageUrls.push(uploadResponse.secure_url); // Store the Cloudinary URL
            }
        }

        // Create new product with category and multiple images (URLs from Cloudinary)
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            user: userId,
            companyName,
            images: imageUrls, // Save Cloudinary image URLs
        });

        // Log the product details being saved
        console.log('Saving Product:', {
            name,
            description,
            price,
            stock,
            category,
            user: userId,
            companyName,
            images: imageUrls,
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
router.put('/product/edit/:id', authenticateUser, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const productId = req.params.id;

        console.log('Incoming data:', req.body);
        console.log('Updating product ID:', productId);

        // Find the existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Prepare the update object with the new data
        const updateData = {
            name,
            description,
            price,
            stock,
            category,
        };

        // If there are new images, update the images field
        if (req.files && req.files.length > 0) {
            // If new images are uploaded, we replace the old images with the new ones
            updateData.images = req.files.map(file => file.path);
        }

        // If no new images are uploaded, retain the existing images (no change)
        if (!req.files || req.files.length === 0) {
            updateData.images = existingProduct.images;
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

        // Check if the profile image is stored in Cloudinary
        const profileImageUrl = user.profileImage ? user.profileImage : null;

        // Check if the address exists
        const address = user.address || 'Address not yet configured';  // If address is not set, show the default message

        // Send back user profile information including the address and Cloudinary image URL
        res.json({
            name: user.name,
            email: user.email,
            profileImage: profileImageUrl,  // Cloudinary URL or null if no profile image
            address: address,  // Include the address or the message if it's not set
        });
    } catch (err) {
        console.error('Error fetching user profile:', err); // Log any server error
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/user/password', authenticateUser, upload.single('profileImage'), async (req, res) => {
    try {
        const { oldPassword, password, address } = req.body;

        // Find user by ID (assumed that user ID is in req.user._id)
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle password update logic if old password is provided
        if (oldPassword && user.password) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password' });
            }
        }

        // Update password if a new one is provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Update profile image using Cloudinary if a new one is provided
        if (req.file) {
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            user.profileImage = result.secure_url;  // Store the Cloudinary image URL in the DB
        }

        // Handle address update logic only if address is provided
        if (address) {
            try {
                // Try parsing the address if it's a stringified JSON
                const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;

                // Destructure the parsed address
                const { street, city, state, postalCode, country } = parsedAddress;

                // Update address fields if they exist in the parsed JSON
                if (street !== undefined) user.address.street = street;
                if (city !== undefined) user.address.city = city;
                if (state !== undefined) user.address.state = state;
                if (postalCode !== undefined) user.address.postalCode = postalCode;
                if (country !== undefined) user.address.country = country;
            } catch (error) {
                // If address is invalid JSON, return an error
                return res.status(400).json({ message: 'Invalid address format. Ensure it is a valid JSON.' });
            }
        }

        // Save the updated user document to the database
        await user.save();

        // Return a success message
        res.json({ message: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
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
