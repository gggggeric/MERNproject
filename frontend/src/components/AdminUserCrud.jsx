import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './AdminUserCrud.css';

const UserCrud = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null); // Store the user being edited
    const [editForm, setEditForm] = useState({ userType: '', status: '' }); // State for the edit form
    const [showEditModal, setShowEditModal] = useState(false); // To toggle the floating modal

    const navigate = useNavigate(); // Initialize the navigate function

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5001/api/auth/users', {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div>Loading users...</div>;
    }

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5001/api/auth/users/${userId}`, {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                });
                setUsers(users.filter(user => user._id !== userId));
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    // User creation form validation schema
    const userCreationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        userType: Yup.string().oneOf(['user', 'admin', 'manufacturer'], 'Invalid user type').required('User type is required')
    });

    // Handle user creation submission
    const handleCreateUser = async (values, { resetForm, setSubmitting }) => {
        setErrorMessage(''); // Clear previous error message
    
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setErrorMessage('No token found in localStorage.');
            setSubmitting(false);
            return;
        }
    
        try {
            const res = await axios.post('http://localhost:5001/api/auth/create', values, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            setUsers([...users, res.data.user]);
            resetForm(); // Reset form after successful submission
            alert('User created successfully!');
        } catch (err) {
            console.error('Error creating user:', err);
            setErrorMessage('Failed to create user. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // User edit form validation schema
    const userEditSchema = Yup.object({
        userType: Yup.string().oneOf(['user', 'admin', 'manufacturer'], 'Invalid user type').required('User type is required'),
        status: Yup.string().oneOf(['true', 'false'], 'Invalid status').required('Status is required')
    });

    // Handle user edit form submission
    const handleEditSubmit = async (values) => {
        try {
            await axios.put(
                `http://localhost:5001/api/auth/users/${editingUser}`,
                {
                    userType: values.userType,
                    status: values.status === 'true' // Ensure this is a boolean
                },
                {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                }
            );
    
            setUsers(users.map(user => user._id === editingUser ? { ...user, ...values } : user));
            setEditingUser(null);
            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user._id); // Set the editing user
        setEditForm({ userType: user.userType, status: user.status }); // Populate form
        setShowEditModal(true); // Show floating edit modal
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditForm({ userType: '', status: '' });
    };

    // Handle back button to navigate to the admin home page
    const handleBack = () => {
        navigate('/adminHomePage'); // Replace with the route you want to navigate to
    };

    return (
        <div className="user-crud-container">
            <button className="back-button" onClick={handleBack}>Back to Admin Home</button> {/* Back button */}

            <div className="user-crud-content">
                <div className="user-management">
                    <div className="user-crud-header">
                        <h2>User Management</h2>
                    </div>

                    {/* User creation form */}
                    <Formik
                        initialValues={{ email: '', password: '', userType: 'user' }}
                        validationSchema={userCreationSchema}
                        onSubmit={handleCreateUser}
                    >
                        {({ isSubmitting }) => (
                            <Form className="user-crud-form">
                                <Field type="email" name="email" placeholder="Email" />
                                <ErrorMessage name="email" component="div" className="error-message" />
    
                                <Field type="password" name="password" placeholder="Password" />
                                <ErrorMessage name="password" component="div" className="error-message" />
    
                                <Field as="select" name="userType">
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="manufacturer">Manufacturer</option>
                                </Field>
                                <ErrorMessage name="userType" component="div" className="error-message" />
    
                                <button type="submit" disabled={isSubmitting} className="create-btn">
                                    Create User
                                </button>
                            </Form>
                        )}
                    </Formik>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                </div>

                {/* All Users Table */}
                <div className="all-users-container">
                    <h3>All Users:</h3>
                    <table className="user-crud-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>User Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.email}</td>
                                    <td>{user.userType}</td>
                                    <td>{user.status ? 'True' : 'False'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="edit-button" 
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </button>
                                            {user.userType !== 'admin' && (
                                                <button 
                                                    className="delete-button" 
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Edit Modal */}
            {showEditModal && (
                <div className="edit-modal">
                    <div className="edit-modal-content">
                        <h3>Edit User</h3>
                        <Formik
                            initialValues={{ userType: editForm.userType, status: editForm.status }}
                            validationSchema={userEditSchema}
                            onSubmit={handleEditSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <label>User Type:</label>
                                    <Field as="select" name="userType">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="manufacturer">Manufacturer</option>
                                    </Field>
                                    <ErrorMessage name="userType" component="div" className="error-message" />
    
                                    <label>Status:</label>
                                    <Field as="select" name="status">
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </Field>
                                    <ErrorMessage name="status" component="div" className="error-message" />
    
                                    <button type="submit" disabled={isSubmitting} className="save-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="delete-btn" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCrud;
