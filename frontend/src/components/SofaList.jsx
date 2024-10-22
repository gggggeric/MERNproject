import React, { useEffect, useState } from 'react';

const SofaList = () => {
    const [sofas, setSofas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSofas = async () => {
            try {
                const response = await fetch('/api/sofas');
                const data = await response.json();
                setSofas(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sofas:', error);
                setLoading(false);
            }
        };

        fetchSofas();
    }, []);

    if (loading) {
        return <p>Loading sofas...</p>;
    }

    return (
        <div>
            <h1>Available Sofas</h1>
            <ul>
                {sofas.map(sofa => (
                    <li key={sofa._id}>
                        <h2>{sofa.name}</h2>
                        <p>{sofa.description}</p>
                        <p>Price: ${sofa.price}</p>
                        <p>Seller: {sofa.seller.email}</p>
                        {/* Here you can add order button only for logged in users */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SofaList;
