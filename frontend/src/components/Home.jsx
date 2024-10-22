// src/components/Home.js
import React from 'react';
import './Home.css'; // Importing CSS for the Home component

// Mock data for sofas
const sofas = [
    {
        id: 1,
        name: "Elegant Sofa",
        price: "$499",
        description: "A beautiful sofa with a sleek design.",
        image: "https://via.placeholder.com/300" // Replace with actual image URLs
    },
    {
        id: 2,
        name: "Comfortable Couch",
        price: "$699",
        description: "Perfect for lounging with family.",
        image: "https://via.placeholder.com/300"
    },
    {
        id: 3,
        name: "Modern Loveseat",
        price: "$399",
        description: "A stylish loveseat for any space.",
        image: "https://via.placeholder.com/300"
    },
];

const Home = () => {
    return (
        <div className="home-container">
            <h1>Available Sofas</h1>
            <div className="sofa-list">
                {sofas.map((sofa) => (
                    <div className="sofa-card" key={sofa.id}>
                        <img src={sofa.image} alt={sofa.name} />
                        <h2>{sofa.name}</h2>
                        <p>{sofa.description}</p>
                        <p className="price">{sofa.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
