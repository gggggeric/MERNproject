import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SellerManageProducts.css'; // Import the CSS file for styling

const SellerManageProducts = () => {
    const [resoldProducts, setResoldProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResoldProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            const response = await axios.get('http://localhost:5001/api/resold-products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setResoldProducts(response.data);
        } catch (err) {
            setError('Failed to fetch resold products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResoldProducts();
    }, []);

    if (loading) return <div className="loading">Loading resold products...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!resoldProducts.length) return <div>No resold products available.</div>;

    return (
        <div>
            <h1>Manage Resold Products</h1>
            <div className="resold-product-container">
                {resoldProducts.map(product => {
                    const imagePath = product.image ? 
                        `http://localhost:5001/uploads/${product.image.replace(/\\/g, '/')}` : 
                        '/path/to/default-image.png'; // Use a default image path if not available

                    return (
                        <div key={product._id} className="resold-product-card">
                            <img 
                                src={imagePath} 
                                alt={product.name} 
                                className="resold-product-image" 
                            />
                            <h2 className="resold-product-name">{product.name}</h2>
                            <p className="resold-product-description">{product.description}</p>
                            <p className="resold-product-price">Price: ₱{product.price}</p>
                            <p className="resold-product-quantity">Quantity Resold: {product.quantity}</p>
                            <p className="resold-product-status">Status: {product.status || 'Available'}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SellerManageProducts;
