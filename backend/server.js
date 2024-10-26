// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes'); // Import product routes

// Load environment variables
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Import authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use product routes
app.use('/api', productRoutes); // Mount the product routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
