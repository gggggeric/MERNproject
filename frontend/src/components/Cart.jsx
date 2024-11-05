// src/components/Cart.js
import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, ListItemAvatar, Avatar } from '@mui/material';

const Cart = ({ cartItems = [], onRemoveItem }) => { // Default to empty array
    const handleRemoveItem = (item) => {
        onRemoveItem(item); // Call the function to remove item from the cart
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Your Cart
            </Typography>
            {cartItems.length === 0 ? (
                <Container sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        Your cart is empty.
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Add some products to your cart to see them here!
                    </Typography>
                </Container>
            ) : (
                <List>
                    {cartItems.map((item) => (
                        <ListItem key={item.product._id}>
                            <ListItemAvatar>
                                <Avatar src={`http://localhost:5001/${item.image}`} alt={item.name} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={item.name}
                                secondary={`Price: $${item.price} | Quantity: ${item.quantity}`}
                            />
                            <Button variant="outlined" color="secondary" onClick={() => handleRemoveItem(item)}>
                                Remove
                            </Button>
                        </ListItem>
                    ))}
                </List>
            )}
        </Container>
    );
};

export default Cart;
