import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { AddCircleOutline, RateReview, ShoppingCart } from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ManufacturerHomePage = () => {
    const navigate = useNavigate();
    const [salesData, setSalesData] = useState(null);
    const [filteredSalesData, setFilteredSalesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handlePostProductClick = () => {
        navigate('/manufacturers/product/CRUD'); // Redirects to the product creation page
    };

    const handleManageReviewsClick = () => {
        navigate('/manufacturer/view/reviews'); // Redirects to the product creation page
    };

    const handleViewOrdersClick = () => {
        navigate('/manufacturers/orders'); // Redirects to the orders page
    };

    useEffect(() => {
        // Fetch monthly sales data from the backend
        const fetchSalesData = async () => {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                setError('Authentication token is missing. Please log in.');
                navigate('/login'); // Redirect to login if no token is found
                return;
            }

            try {
                const response = await axios.get('http://localhost:5001/api/auth/sales/monthly', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setSalesData(response.data);
                    setFilteredSalesData(response.data); // Initially, no filtering
                    setLoading(false);
                } else {
                    throw new Error('Failed to fetch sales data');
                }
            } catch (error) {
                console.error('Error fetching sales data:', error);
                setLoading(false);
                setError('Error fetching sales data. Please try again later.');
                // Handle unauthorized error specifically (e.g., session expired)
                if (error.response && error.response.status === 401) {
                    setError('Session expired. Please log in again.');
                    navigate('/login'); // Redirect to login page
                }
            }
        };

        fetchSalesData();
    }, [navigate]);

    // Prepare the chart data
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const monthIndexMap = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    const filterSalesData = () => {
        if (!startDate || !endDate) {
            setFilteredSalesData(salesData);
            return;
        }

        const filteredData = salesData.filter(item => {
            const itemDate = new Date(`${item.month} 1, 2024`); // Assuming the month is in the format "January", etc.
            return itemDate >= startDate && itemDate <= endDate;
        });

        setFilteredSalesData(filteredData);
    };

    const handleDateChange = () => {
        filterSalesData();
    };

    // Initialize sales array for all 12 months (default to 0)
    const salesByMonth = new Array(12).fill(0);

    // Populate sales data for the months that have data
    if (filteredSalesData) {
        filteredSalesData.forEach(item => {
            const monthIndex = monthIndexMap[item.month];
            if (monthIndex !== undefined) {
                salesByMonth[monthIndex] = item.totalSales;
            }
        });
    }

    // Chart data structure
    const chartData = {
        labels: monthNames, // All months from Jan to Dec
        datasets: [
            {
                label: 'Monthly Sales',
                data: salesByMonth, // Sales data for all months
                borderColor: 'rgba(75, 192, 192, 1)', // Line color
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color
                fill: true, // Fill the area under the line
                tension: 0.4, // Smooth curve of the line
            },
        ],
    };

    return (
        <Container sx={{ py: 8, bgcolor: 'background.default' }}>
            <Typography variant="h4" component="h2" gutterBottom textAlign="center">
                Manufacturer Dashboard
            </Typography>

            <Card variant="outlined" sx={{ textAlign: 'center', mb: 4, border: 2, borderColor: 'grey.300' }}>
                <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                        Actions
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<AddCircleOutline />} 
                                onClick={handlePostProductClick}
                            >
                                Post a Product
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                startIcon={<RateReview />} 
                                onClick={handleManageReviewsClick}
                            >
                                Manage Reviews
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                startIcon={<ShoppingCart />} 
                                onClick={handleViewOrdersClick}
                            >
                                View Orders
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Error Message Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Date Range Picker */}
            <Box display="flex" justifyContent="center" gap={4} mb={4}>
                <Box textAlign="center">
                    <Typography variant="h6" mb={1}>
                        Start Date
                    </Typography>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                    />
                </Box>
                <Box textAlign="center">
                    <Typography variant="h6" mb={1}>
                        End Date
                    </Typography>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        onBlur={handleDateChange}
                    />
                </Box>
            </Box>

            {/* Monthly Sales Chart */}
            <Card variant="outlined" sx={{ mb: 4, border: 2, borderColor: 'grey.300' }}>
                <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                        Monthly Sales
                    </Typography>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Line data={chartData} />
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default ManufacturerHomePage;
