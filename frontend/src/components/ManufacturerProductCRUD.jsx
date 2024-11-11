import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    IconButton, 
    Collapse 
} from '@mui/material';
import './ManufacturerProductCRUD.css';
import { ExpandLess, ExpandMore } from '@mui/icons-material';


const ManufacturerProductCRUD = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]); // Track selected products
    const [expandedRow, setExpandedRow] = useState(null); // Track expanded row
    const [images, setImages] = useState([]); // State for multiple images

    const toggleRow = (productId) => {
        if (expandedRow === productId) {
            setExpandedRow(null); // Collapse if it's already expanded
        } else {
            setExpandedRow(productId); // Expand the clicked row
        }
    };
    
    const handleExpandClick = (productId) => {
        setExpandedRow(expandedRow === productId ? null : productId); // Toggle expand/collapse
    };


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
    
        // Check for required fields and images (multiple image support)
        if (!name || !description || !price || !stock || !category || (images.length === 0 && !isEditing)) {
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
        formData.append('category', category);
    
        // Convert FileList to an array and append all selected images to the FormData object
        if (images.length > 0) {
            Array.from(images).forEach((image) => {
                formData.append('images', image); // 'images' is the field name used in the backend (Express)
            });
        }
    
        try {
            setLoading(true);
    
            // If editing, update the existing product
            if (isEditing) {
                // Include productId in the request for editing
                await axios.put(`http://localhost:5001/api/auth/product/edit/${currentProductId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccess('Product updated successfully!');
            } else {
                // If creating a new product, send a POST request
                await axios.post('http://localhost:5001/api/auth/product/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccess('Product created successfully!');
            }
    
            // Fetch the products after a successful operation
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
        setCategory('');
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
            setCategory(product.category);
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

    // Handle checkbox change for selecting products
    const handleSelectProduct = (productId) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId) // Deselect
                : [...prevSelected, productId] // Select
        );
    };

    // Bulk delete selected products
    const handleBulkDelete = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        try {
            await axios.delete('http://localhost:5001/api/auth/products/bulk-delete', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    productIds: selectedProducts,
                },
            });

            setSuccess('Products deleted successfully!');
            fetchProducts();
            setSelectedProducts([]); // Clear selected products after successful delete
        } catch (err) {
            console.error('Error deleting products:', err);
            setError('Failed to delete products');
        }
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
                        <label htmlFor="category">Category:</label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Image:</label>
                     <input 
                        type="file" 
                        id="imageInput" 
                        accept="image/*" 
                        multiple 
                        onChange={(e) => setImages(e.target.files)} 
                        required={!isEditing} 
                    />

                    </div>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
                    </Button>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </form>
            </div>

            <div className="product-card">
            <h2>Your Products</h2>

            {products.length > 0 ? (
                <>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleBulkDelete}
                        disabled={selectedProducts.length === 0}
                    >
                        Delete Selected Products
                    </Button>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.length}
                                            onChange={() => {
                                                if (selectedProducts.length === products.length) {
                                                    setSelectedProducts([]);
                                                } else {
                                                    setSelectedProducts(products.map((product) => product._id));
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <React.Fragment key={product._id}>
                                        <TableRow>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => handleSelectProduct(product._id)}
                                                />
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>{product.price}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>
                                        {product.images && product.images.length > 0 ? (
                                        product.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={`http://localhost:5001/${image}`}
                                                alt={`Product Image ${index + 1}`}
                                                style={{ width: '50px', height: '50px', marginRight: '10px' }}
                                            />
                                        ))
                                    ) : (
                                        <p>No images available</p>
)}

                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleEdit(product._id)}>Edit</Button>
                                                <Button onClick={() => handleDelete(product._id)}>Delete</Button>
                                                {/* Expand/Collapse Button */}
                                                <IconButton onClick={() => handleExpandClick(product._id, product)}>
                                                    {expandedRow === product._id ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Content Row */}
                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <Collapse in={expandedRow === product._id} timeout="auto" unmountOnExit>
                                                    {/* Expanded details */}
                                                    <div>
                                                        {isEditing ? (
                                                            <div>
                                                                <Typography variant="h6">Edit Product</Typography>
                                                                <input
                                                                    type="text"
                                                                    value={name}
                                                                    onChange={(e) => setName(e.target.value)}
                                                                    placeholder="Product Name"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    placeholder="Description"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={price}
                                                                    onChange={(e) => setPrice(e.target.value)}
                                                                    placeholder="Price"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={stock}
                                                                    onChange={(e) => setStock(e.target.value)}
                                                                    placeholder="Stock"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={category}
                                                                    onChange={(e) => setCategory(e.target.value)}
                                                                    placeholder="Category"
                                                                />
                                                                {/* You can add a Save Button here to submit the changes */}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <Typography variant="body1">Product Description: {product.description}</Typography>
                                                                <Typography variant="body1">Product Price: {product.price}</Typography>
                                                                {/* Display other details */}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <Typography>No products available</Typography>
            )}
        </div>

            <Dialog open={showDeleteConfirm} onClose={cancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this product?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManufacturerProductCRUD; 