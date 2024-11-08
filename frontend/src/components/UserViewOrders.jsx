import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserViewOrders.css'; // Import the CSS for styling

const UserViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          setError('You are not logged in. Please log in to view your orders.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5001/api/auth/view/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);

        if (err.response) {
          if (err.response.status === 401) {
            setError('You need to log in to view your orders.');
          } else if (err.response.status === 403) {
            setError('You are not authorized to view these orders.');
          } else if (err.response.status === 404) {
            setError('Orders not found. Please check the backend route or try again later.');
          } else if (err.response.status === 500) {
            setError('Server error. Please try again later.');
          } else {
            setError('Error fetching orders. Please try again later.');
          }
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't made any orders yet.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created At</th>
              <th>Products</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.orderStatus}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <ul>
                    {order.products.map((item) => (
                      <li key={item.product._id}>
                        {item.product.name} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserViewOrders;
