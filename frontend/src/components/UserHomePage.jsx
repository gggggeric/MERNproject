import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel'; // Import Carousel component
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles


import './UserHomePage.css';

const UserHomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [orderSuccessModal, setOrderSuccessModal] = useState(false);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState(''); // State for category filter
    const [categories, setCategories] = useState([]); // New state for categories
    const [priceSort, setPriceSort] = useState(''); // New state for price sorting
    const [paymentMethod, setPaymentMethod] = useState('');  // Add state for paymentMethod
    const [shippingStatus, setShippingStatus] = useState('');  // Add state for shippingStatus
    const [shippingMethod, setShippingMethod] = useState('');
  // Handle price filter search logic
 
    const renderStars = (rating) => {
        const totalStars = 5;
        let stars = [];
        for (let i = 1; i <= totalStars; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#FFD700' : '#ddd' }}>★</span>
            );
        }
        return stars;
    };
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
    
            // Fetch products with filters applied
            const res = await axios.get('http://localhost:5001/api/auth/user/products', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 
                    page, 
                    limit: 10, 
                    rating: ratingFilter, 
                    category: categoryFilter, 
            
                }
            });
    
            // Handle no more products case
            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                // Sort products based on priceSort state
                if (priceSort === 'lowToHigh') {
                    res.data.sort((a, b) => a.price - b.price);
                } else if (priceSort === 'highToLow') {
                    res.data.sort((a, b) => b.price - a.price);
                }
    
                // If page === 1, replace products; otherwise, add to current list
                setProducts(prevProducts => page === 1 ? res.data : [...prevProducts, ...res.data]);
    
                // Populate unique categories from the product list if not already set
                if (categories.length === 0) {
                    const uniqueCategories = [...new Set(res.data.map(product => product.category))];
                    setCategories(uniqueCategories);
                }
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            setLoading(false);
        }
    }, [page, ratingFilter, categoryFilter, categories.length, priceSort]); 
    
    

    useEffect(() => {
        setProducts([]); // Clear products when filters change
        setPage(1); // Reset to page 1 when filters change
        setHasMore(true); // Reset hasMore in case there are more products to load
        fetchProducts();
    }, [fetchProducts, ratingFilter, categoryFilter, priceSort]); 

    const handleScroll = useCallback((e) => {
        const bottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 10;
    
        if (bottom && hasMore && !loading) {
            // Trigger data fetching only when you're at the bottom and there's more data
            setPage(prevPage => prevPage + 1);
            setLoading(true);
        }
    }, [loading, hasMore]);
    
useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    return () => {
        // Clean up event listener on component unmount
        window.removeEventListener('scroll', handleScroll);
    };
}, [handleScroll]);
const handlePlaceOrder = async (product) => {
    const token = localStorage.getItem('auth-token');

    const orderDataToSend = {
        products: [
            { product: product._id, quantity: quantity }
        ],
        paymentMethod,
        shippingMethod,
        shippingStatus,
    };

    try {
        await axios.post('http://localhost:5001/api/auth/order/place', orderDataToSend, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // If successful, show the success modal and reset the form
        setOrderSuccessModal(true);
        setOpenModal(false);
        setQuantity(1);
        setPaymentMethod('');
        setShippingMethod('');
        setShippingStatus('');
    } catch (err) {
        // If there is an error, check for specific messages in the response
        if (err.response && err.response.data && err.response.data.error) {
            alert(`Error: ${err.response.data.error}, Double check you address in your profile!'`);
        } else {
            alert('Failed to place the order. Please try again, Double check you address in your profile!');
        }
    }
};


const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity when opening the modal
    setPaymentMethod(''); // Reset payment method when opening the modal
    setShippingMethod(''); // Reset shipping method when opening the modal
    setOpenModal(true); // Open the modal
};

    const handleCloseModal = () => setOpenModal(false);
    const handleCloseOrderSuccessModal = () => setOrderSuccessModal(false);

    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value) || 1);
        setQuantity(value);
    };

    const handleRatingFilterChange = (event) => {
        setRatingFilter(event.target.value);
        setProducts([]);
        setPage(1);
    };

    const handleCategoryFilterChange = (event) => {
        setCategoryFilter(event.target.value);
        setProducts([]);
        setPage(1);
    };
    
    if (loading && page === 1) {
        return (
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f0f0f0', mb: 4 }}>
                <CircularProgress />
                <Typography variant="h5" sx={{ mt: 2 }}>Loading products...</Typography>
            </Paper>
        );
    }
    
    if (error) {
        return (
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f0f0f0', mb: 4 }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Paper>
        );
    }

    return (
        <div>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',   
                padding: '20px',
                backgroundColor: '#fff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px',
                maxWidth: '500px',
                margin: '0 auto',
                borderRadius: '12px',
            }}>
                <FormControl fullWidth sx={{ width: '250px', backgroundColor: 'white', borderRadius: 2 }}>
                    <InputLabel id="rating-filter-label">Filter by Rating</InputLabel>
                    <Select
                        labelId="rating-filter-label"
                        value={ratingFilter}
                        onChange={handleRatingFilterChange}
                        label="Filter by Rating"
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value={0}>All Ratings</MenuItem>
                        <MenuItem value={1}>1 Star & Above</MenuItem>
                        <MenuItem value={2}>2 Stars & Above</MenuItem>
                        <MenuItem value={3}>3 Stars & Above</MenuItem>
                        <MenuItem value={4}>4 Stars & Above</MenuItem>
                        <MenuItem value={5}>5 Stars</MenuItem>
                    </Select>
                </FormControl>

                {/* Category Filter Dropdown */}
                <FormControl fullWidth sx={{ width: '250px', backgroundColor: 'white', borderRadius: 2, marginLeft: 2 }}>
                    <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        value={categoryFilter}
                        onChange={handleCategoryFilterChange}
                        label="Filter by Category"
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category, index) => (
                            <MenuItem key={index} value={category}>{category}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ width: '250px', backgroundColor: 'white', borderRadius: 2, marginLeft: 2 }}>
                <InputLabel id="price-sort-label">Sort by Price</InputLabel>
                <Select
                    labelId="price-sort-label"
                    value={priceSort}
                    onChange={(event) => setPriceSort(event.target.value)}
                    label="Sort by Price"
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="lowToHigh">Lowest to Highest</MenuItem>
                    <MenuItem value="highToLow">Highest to Lowest</MenuItem>
                </Select>
            </FormControl>

            </Box>

            <Grid container spacing={4} justifyContent="center" sx={{ paddingTop: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 } }}>
                <div style={{ position: 'relative' }}>
                    {/* Check if there are multiple images, use a Carousel */}
                    {product.images && product.images.length > 0 ? (
                     <Carousel>
                     {product.images.map((image, index) => (
                       <CardMedia
                         key={index}
                         component="img"
                         alt={product.name}
                         height="200"
                         image={image} // Use the Cloudinary URL directly
                         sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
                       />
                     ))}
                   </Carousel>
                   
                    ) : (
                        <CardMedia
                            component="img"
                            alt={product.name}
                            height="200"
                            image={`http://localhost:5001/${product.image}`} // Fallback image
                            sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
                        />
                    )}
                </div>

                <CardContent sx={{ backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {product.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, color: '#1976d2' }}>
                        Price: ₱{product.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Stock: {product.stock}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Company: {product.companyName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Category: {product.category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Rating: </Typography>
                        <Box sx={{ ml: 1, display: 'flex' }}>
                            {renderStars(product.averageRating || 0)} {/* Default rating to 0 if not available */}
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: '100%', marginTop: 2 }}
                        onClick={() => handleOpenModal(product)}
                    >
                        Place Order
                    </Button>
                </CardContent>
            </Card>
        </Grid>
    ))}
</Grid>

       {/* Order Modal */}
{/* Order Modal */}
<Dialog open={openModal} onClose={handleCloseModal}>
    <DialogTitle>Place Order</DialogTitle>
    <DialogContent>
        {/* Quantity Field */}
        <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 1 }}
        />

        {/* Payment Method Dropdown */}
        <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="G-cash">G-cash</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cash On Delivery">Cash On Delivery</MenuItem>
            </Select>
        </FormControl>

        {/* Shipping Method Dropdown */}
        <FormControl fullWidth margin="normal">
            <InputLabel>Shipping Method</InputLabel>
            <Select
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
            >
                <MenuItem value="Lalamove">Lalamove</MenuItem>
                <MenuItem value="Grab">Grab</MenuItem>
                <MenuItem value="Ali-Express">Ali-Express</MenuItem>
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button
            onClick={() => handlePlaceOrder(selectedProduct)}
            variant="contained"
            color="primary"
        >
            Place Order
        </Button>
    </DialogActions>
</Dialog>


            {/* Order Success Modal */}
            <Dialog open={orderSuccessModal} onClose={handleCloseOrderSuccessModal}>
                <DialogTitle>Order Placed Successfully!</DialogTitle>
                <DialogContent>
                    <Typography>Your order has been successfully placed.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseOrderSuccessModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserHomePage;
