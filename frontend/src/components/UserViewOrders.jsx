import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserViewOrders.css'; // Import the CSS for styling

const UserViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // Store the selected order for review
  const [review, setReview] = useState({ rating: 0, description: '', image: null, productId: '' }); // Review data
  const [imagePreview, setImagePreview] = useState(null); // Preview of the uploaded image

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

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem('auth-token');
    const formData = new FormData();
    formData.append('productId', review.productId); // Ensure productId is passed from the modal
    formData.append('rating', review.rating);
    formData.append('description', review.description);
    if (review.image) formData.append('image', review.image);

    // Debug: Log the formData to check if all fields are added correctly
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/submit-review',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Review submitted:', response.data);
      setModalVisible(false); // Close the modal after submission
    } catch (error) {
      // Debug: Log the full error to check the response details
      console.error('Error submitting review:', error.response || error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || error.response.statusText}`);
      } else {
        alert('Error submitting review. Please try again later.');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setReview({ ...review, image: file });
    setImagePreview(URL.createObjectURL(file)); // Preview image
  };

  const openReviewModal = (order, product) => {
    setSelectedOrder(order);
    setReview({ ...review, productId: product._id }); // Set the productId for the selected product
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setReview({ rating: 0, description: '', image: null, productId: '' });
    setImagePreview(null);
  };

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
              <th>Actions</th>
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
                <td>
                  {/* Only show the "Submit Review" button if the order status is "Accepted" */}
                  {order.orderStatus === 'Accepted' && (
                    <button
                      className="review-button"
                      onClick={() => openReviewModal(order, order.products[0].product)} // Pass product data here
                    >
                      Submit a Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for submitting a review */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit a Review for {selectedOrder && selectedOrder.products.find(p => p._id === review.productId)?.product.name}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>Rating (1-5):</label>
              <input
                type="number"
                min="1"
                max="5"
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
                required
              />
              <label>Description:</label>
              <textarea
                value={review.description}
                onChange={(e) => setReview({ ...review, description: e.target.value })}
                required
              />
              <label>Upload Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" onClick={handleReviewSubmit}>
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserViewOrders;
