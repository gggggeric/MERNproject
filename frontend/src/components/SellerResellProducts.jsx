import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SellerResellProducts.css'; // Import the CSS file for styling

const SellerResellProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1); // Default quantity for re-selling

    const fetchProducts = async () => {
        setLoading(true); // Set loading to true when fetching products
        try {
            // Retrieve the token from localStorage
            const token = localStorage.getItem('auth-token');

            // Make the API request with the token in the headers
            const response = await axios.get('http://localhost:5001/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleResell = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
        setQuantity(1); // Reset quantity to 1 when opening modal
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            // Retrieve the token from localStorage
            const token = localStorage.getItem('auth-token');

            // Make POST request to create a resell product entry with the token in the headers
            await axios.post('http://localhost:5001/api/resellProducts', {
                productId: selectedProduct._id,
                quantity,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            fetchProducts(); // Refetch products to update stock
            setModalOpen(false); // Close the modal
            alert('Ordered successfully!'); // Optional: noy usertif
        } catch (err) {
            console.error('Error during re-sell:', err);
            setError(err.response?.data?.message || 'Failed to re-sell product'); // More informative error message
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null); // Reset selected product
        setQuantity(1); // Reset quantity to default
    };

    if (loading) return <div className="loading">Loading products...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!products.length) return <div>No products available.</div>;

    return (
        <div>
            <h1>Resell Products</h1>
            <div className="product-container">
                {products.map(product => (
                    <div key={product._id} className="product-card">
                        {product.image && (
                            <img 
                                src={`http://localhost:5001/${product.image.replace(/\\/g, '/')}`} 
                                alt={product.name} 
                                className="product-image" 
                            />
                        )}
                        <h2 className="product-name">{product.name}</h2>
                        <p className="product-description">{product.description}</p>
                        <p className="product-price">Price: ₱{product.price}</p>
                        <p className="product-quantity">Quantity: {product.stock || 'N/A'}</p>
                        <button onClick={() => handleResell(product)} className="button resell-button">Re-Sell</button>
                    </div>
                ))}
            </div>

            {/* Modal for Re-selling Products */}
            {modalOpen && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Re-sell {selectedProduct.name}</h2>
                        <form onSubmit={handleModalSubmit}>
                            <label>
                                Quantity:
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Number(e.target.value), selectedProduct.stock) || 1)} // Ensure max quantity is respected
                                    min="1"
                                    max={selectedProduct.stock} // Max quantity based on stock
                                />
                            </label>
                            <button type="submit" className="button">Submit</button>
                            <button type="button" onClick={handleCloseModal} className="button">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerResellProducts;
