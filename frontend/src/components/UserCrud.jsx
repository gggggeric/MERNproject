import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserCrud.css';

const UserCrud = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', userType: 'user' });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null); // Store the user being edited
    const [editForm, setEditForm] = useState({ userType: '', status: '' }); // State for the edit form
    const [showEditModal, setShowEditModal] = useState(false); // To toggle the floating modal

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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error message

        try {
            const res = await axios.post('http://localhost:5001/api/auth/register', newUser, {
                headers: { 'auth-token': localStorage.getItem('auth-token') }
            });
            setUsers([...users, res.data]);
            setNewUser({ email: '', password: '', userType: 'user' });
            alert('User created successfully!'); // Optional: notify user
        } catch (err) {
            console.error('Error creating user:', err);
            setErrorMessage('Failed to create user. Please try again.');
        }
    };

    // Trigger editing mode and populate the edit form with the selected user's data
    const handleEdit = (user) => {
        setEditingUser(user._id); // Set the editing user
        setEditForm({ userType: user.userType, status: user.status }); // Populate form
        setShowEditModal(true); // Show floating edit modal
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
    
        console.log('Editing user ID:', editingUser);
        console.log('Edit form data:', editForm);
    
        try {
            const response = await axios.put(
                `http://localhost:5001/api/auth/users/${editingUser}`,
                {
                    userType: editForm.userType,
                    status: editForm.status === 'true' // Ensure this is a boolean
                },
                {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                }
            );
    
            console.log('Response from server:', response.data);
            setUsers(users.map(user => user._id === editingUser ? { ...user, ...editForm } : user));
            setEditingUser(null);
            setEditForm({ userType: '', status: '' });
            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };
    
    
    
    
    

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditForm({ userType: '', status: '' });
    };

    return (
        <div className="user-crud-container">
            <div className="user-crud-header">
                <h2>User Management</h2>
            </div>
            <form onSubmit={handleCreateUser} className="user-crud-form">
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={newUser.password} 
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                    required 
                />
                <select 
                    value={newUser.userType} 
                    onChange={e => setNewUser({ ...newUser, userType: e.target.value })}
                >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" className="create-btn">Create User</button>
            </form>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
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

            {/* Floating Edit Modal */}
            {showEditModal && (
                <div className="edit-modal">
                    <div className="edit-modal-content">
                        <h3>Edit User</h3>
                        <form onSubmit={handleEditSubmit}>
                            <label>User Type:</label>
                            <select 
                                value={editForm.userType} 
                                onChange={e => setEditForm({ ...editForm, userType: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                            </select>
                            <label>Status:</label>
                            <select 
                                value={editForm.status} 
                                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                            <button type="submit" className="save-btn">Save Changes</button>
                            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCrud;
