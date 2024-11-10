import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Carousel } from 'react-responsive-carousel'; // Import Carousel component
import './ManufacturersOrders.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'accepted', 'pending'

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await axios.get('http://localhost:5001/api/auth/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
        setFilteredOrders(response.data); // Default to all orders
      } catch (error) {
        console.error('Error fetching orders:', error.response ? error.response.data : error.message);
        setError(error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const acceptOrder = async (orderId) => {
    setAccepting(orderId);
    try {
      const token = localStorage.getItem('auth-token');
      await axios.patch(
        `http://localhost:5001/api/auth/orders/${orderId}/status`,
        { status: 'Accepted' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: 'Accepted' } : order
        )
      );
      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: 'Accepted' } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : error.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);

    if (event.target.value === 'all') {
      setFilteredOrders(orders);
    } else if (event.target.value === 'accepted') {
      setFilteredOrders(orders.filter((order) => order.orderStatus === 'Accepted'));
    } else {
      setFilteredOrders(orders.filter((order) => order.orderStatus === 'Pending'));
    }
  };

  if (loading) return <CircularProgress />; // Show loading spinner while fetching data

  if (error) {
    const errorMessage = typeof error === 'object' && error.msg ? error.msg : error;
    return <Typography color="error">Error: {errorMessage}</Typography>;
  }

  return (
    <div className="order-list-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: '1.5rem' }}>
        Orders
      </Typography>
    
      {/* Filter Dropdown */}
      <FormControl sx={{ mb: 2 }}>
        <InputLabel id="filter-label">Filter</InputLabel>
        <Select
          labelId="filter-label"
          id="filter-select"
          value={filter}
          onChange={handleFilterChange}
          label="Filter"
          size="small"
        >
          <MenuItem value="all">All Orders</MenuItem>
          <MenuItem value="accepted">Accepted Orders</MenuItem>
          <MenuItem value="pending">Pending Orders</MenuItem>
        </Select>
      </FormControl>

      {filteredOrders.length === 0 ? (
        <Typography variant="body1" color="textSecondary">No orders available for the selected filter.</Typography>
      ) : (
        filteredOrders.map((order) => (
          <Card key={order._id} sx={{ mb: 3, p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>Order ID: {order._id}</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                <strong>Customer:</strong> ({order.user?.email || 'N/A'})
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                <strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                <strong>Status:</strong> {order.orderStatus}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, fontSize: '1rem' }}>Products Ordered:</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {order.products.map(({ product, quantity }) =>
                  product ? (
                    <Card key={product._id} sx={{ display: 'flex', mb: 2 }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Carousel>
                          {product.images && product.images.length > 0 ? (
                            product.images.map((image, index) => (
                              <div key={index}>
                                <img
                                  src={`http://localhost:5001/${image}`}
                                  alt={`${product.name} - Image ${index + 1}`}
                                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                />
                              </div>
                            ))
                          ) : (
                            <div>
                              <img
                                src="/path/to/fallback-image.jpg"
                                alt="Fallback"
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                        </Carousel>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Product Name:</strong> {product.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <strong>Description:</strong> {product.description}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <strong>Price:</strong> ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <strong>Quantity:</strong> {quantity}
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : null
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <small>Order Date: {new Date(order.createdAt).toLocaleString()}</small>
              </Typography>

              {order.orderStatus === 'Pending' && (
                <Button
                  onClick={() => acceptOrder(order._id)}
                  disabled={accepting === order._id}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {accepting === order._id ? 'Accepting...' : 'Accept Order'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrderList;
