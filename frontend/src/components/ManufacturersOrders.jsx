// src/components/OrderList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManufacturersOrders.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);

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
    } catch (error) {
      console.error('Error updating order status:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : error.message);
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (error) {
    const errorMessage = typeof error === 'object' && error.msg ? error.msg : error;
    return <p className="error-message">Error: {errorMessage}</p>;
  }

  return (
    <div className="order-list-container">
      <h2>Orders for Your Products</h2>
      {orders.length === 0 ? (
        <p className="no-orders-message">No orders yet. Check back later!</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Order ID: {order._id}</h3>
            <p><strong>Customer:</strong> ({order.user?.email || 'N/A'})</p>
            <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <h4>Products Ordered:</h4>
            <div className="order-products">
              {order.products.map(({ product, quantity }) =>
                product ? (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={`http://localhost:5001/${product.image}`} alt={product.name} />
                      ) : (
                        <img src="/path/to/fallback-image.jpg" alt="Fallback" />
                      )}
                    </div>
                    <div className="product-details">
                      <p><strong>Product Name:</strong> {product.name}</p>
                      <p><strong>Description:</strong> {product.description}</p>
                      <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                      <p><strong>Quantity:</strong> {quantity}</p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
            <p><small>Order Date: {new Date(order.createdAt).toLocaleString()}</small></p>

            {order.orderStatus === 'Pending' && (
              <button
                onClick={() => acceptOrder(order._id)}
                disabled={accepting === order._id}
              >
                {accepting === order._id ? 'Accepting...' : 'Accept Order'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
