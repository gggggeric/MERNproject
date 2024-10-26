import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SellerResellProducts.css'; // Import the CSS file for styling

const SellerResellProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/products'); // Update with your actual endpoint
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
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
                        <p className="product-quantity">Quantity: {product.stock || product.quantity || 'N/A'}</p>
                        <button onClick={() => handleResell(product)} className="button resell-button">Re-Sell</button>
                        <button onClick={() => handleAddToCart(product)} className="button add-to-cart-button">Add to Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Placeholder functions for button actions
const handleResell = (product) => {
    console.log('Re-selling product:', product);
    // Add logic for re-selling
};

const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    // Add logic for adding to cart
};

export default SellerResellProducts;
