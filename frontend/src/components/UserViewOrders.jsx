import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserViewOrders.css';
import { Filter } from 'bad-words';  // Import bad-words package

const UserViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [review, setReview] = useState({ rating: 0, description: '', image: null, productId: '', reviewId: null });
  const [imagePreview, setImagePreview] = useState(null);

  // Create a filter instance
  const filter = new Filter();

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
        setError(err.response?.data?.message || 'Error fetching orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReviewSubmit = async () => {
    // Clean the description before submission
    const cleanDescription = filter.clean(review.description);
    
    const token = localStorage.getItem('auth-token');
    const formData = new FormData();
    formData.append('productId', review.productId);
    formData.append('rating', review.rating);
    formData.append('description', cleanDescription);  // Send the cleaned description
    if (review.image) formData.append('image', review.image);

    try {
      const endpoint = review.reviewId
        ? `http://localhost:5001/api/auth/update-review/${review.reviewId}`
        : 'http://localhost:5001/api/auth/submit-review';

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Review submitted:', response.data);
      setModalVisible(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Error: ${error.response?.data?.message || error.response?.statusText || 'Please try again later.'}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setReview({ ...review, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const openReviewModal = (order, product) => {
    const existingReview = product.review || null;
    setSelectedOrder(order);

    setReview({
      rating: existingReview ? existingReview.rating : 0,
      description: existingReview ? existingReview.description : '',
      image: null,
      productId: product._id,
      reviewId: existingReview ? existingReview._id : null,
    });

    setImagePreview(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setReview({ rating: 0, description: '', image: null, productId: '', reviewId: null });
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
                  {order.orderStatus === 'Accepted' && (
                    <button
                      className="review-button"
                      onClick={() => openReviewModal(order, order.products[0].product)}
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

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit a Review for {selectedOrder && selectedOrder.products.find(p => p.product._id === review.productId)?.product.name}</h2>
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
                  {review.reviewId ? 'Update Review' : 'Submit Review'}
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
