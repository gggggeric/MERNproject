import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import './ManufacturerCreateProduct.css'; // Import your CSS file

const ManufacturerCreateProduct = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!name || !description || !price || !stock || !image) {
            setError('All fields are required');
            return;
        }

        if (price <= 0 || stock < 0) {
            setError('Price must be greater than 0 and stock cannot be negative.');
            return;
        }

        const token = localStorage.getItem('auth-token'); // Ensure the key matches
        if (!token) {
            setError('No authorization token found');
            return;
        }

        // Decode the token to get user type
        const decodedToken = jwtDecode(token);
        const userType = decodedToken.userType;

        // Check if user type is 'manufacturer'
        if (userType !== 'manufacturer') {
            setError('You do not have permission to create products.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('image', image);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5001/api/auth/product/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set Content-Type for FormData
                    Authorization: `Bearer ${token}`, // Fixed string interpolation
                },
            });

            setSuccess('Product created successfully!');
            console.log('Product created:', response.data);

            // Clear form after success
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setImage(null);
            document.getElementById('imageInput').value = ''; // Clear file input
        } catch (err) {
            console.error('Error creating product:', err);
            const message = err.response?.data?.msg || 'Server error';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Create Product</h2>
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
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Product'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
        </div>
    );
};

export default ManufacturerCreateProduct;
