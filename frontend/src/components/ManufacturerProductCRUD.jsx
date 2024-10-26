import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './ManufacturerProductCRUD.css';

const ManufacturerProductCRUD = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Fetch products
    const fetchProducts = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5001/api/auth/products', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.length === 0) {
                setError('No products found');
            } else {
                setProducts(response.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.response?.data?.msg || 'Server error');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !description || !price || !stock || (!image && !isEditing)) {
            setError('All fields are required');
            return;
        }

        if (price <= 0 || stock < 0) {
            setError('Price must be greater than 0 and stock cannot be negative.');
            return;
        }

        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        const decodedToken = jwtDecode(token);
        const userType = decodedToken.userType;

        if (userType !== 'manufacturer') {
            setError('You do not have permission to create products.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        if (image) formData.append('image', image);

        try {
            setLoading(true);

            if (isEditing) {
                await axios.put(`http://localhost:5001/api/auth/product/edit/${currentProductId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccess('Product updated successfully!');
            } else {
                await axios.post('http://localhost:5001/api/auth/product/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccess('Product created successfully!');
            }

            fetchProducts();
            resetForm();
        } catch (err) {
            console.error('Error saving product:', err);
            const message = err.response?.data?.msg || 'Server error';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setImage(null);
        setCurrentProductId(null);
        setIsEditing(false);
        document.getElementById('imageInput').value = ''; // Clear file input
    };

    const handleEdit = async (productId) => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5001/api/auth/product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const product = response.data.product;
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price);
            setStock(product.stock);
            setCurrentProductId(productId);
            setIsEditing(true);
        } catch (err) {
            console.error('Error fetching product for edit:', err);
            setError('Failed to load product for editing');
        }
    };

    const handleDelete = async (productId) => {
        setShowDeleteConfirm(true);
        setCurrentProductId(productId);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        try {
            await axios.delete(`http://localhost:5001/api/auth/product/${currentProductId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccess('Product deleted successfully!');
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            const message = err.response?.data?.message || 'Server error';
            setError(message);
        } finally {
            setShowDeleteConfirm(false);
            setCurrentProductId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setCurrentProductId(null);
    };

    return (
        <div className="container">
            <div className="form-card">
                <h2>{isEditing ? 'Edit Product' : 'Create Product'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stock">Stock:</label>
                        <input
                            type="number"
                            id="stock"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Image:</label>
                        <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            required={!isEditing}
                        />
                    </div>
                    <button type="submit" className="create-button" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
                    </button>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </form>
            </div>

            <div className="product-card">
                <h2>Your Products</h2>
                {products.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Image</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>₱{product.price}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        {product.image && (
                                            <img src={`http://localhost:5001/${product.image.replace(/\\/g, '/')}`} alt={product.name} width="50" />
                                        )}
                                    </td>
                                    <td>
                                        <button className="edit-button" onClick={() => handleEdit(product._id)}>Edit</button>
                                        <button className="delete-button" onClick={() => handleDelete(product._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="confirm-delete">
                    <p>Are you sure you want to delete this product?</p>
                    <button onClick={confirmDelete}>Yes, delete</button>
                    <button onClick={cancelDelete}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default ManufacturerProductCRUD;
