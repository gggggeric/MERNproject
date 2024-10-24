// src/components/Home.js
import React from 'react';
import Slider from 'react-slick'; // Importing Slider from react-slick
import './Home.css'; // Importing CSS for the Home component
import image1 from '../photos/image1.jpg'; // Ensure this path is correct
import image2 from '../photos/image2.jpg';
import image4 from '../photos/image4.jpeg'; // Ensure this path is correct
import image5 from '../photos/image5.jpg';
import 'slick-carousel/slick/slick.css'; // Import slick CSS
import 'slick-carousel/slick/slick-theme.css'; // Import slick theme CSS

const Home = () => {
    const settings = {
        dots: true, // Show dots for navigation
        infinite: true, // Infinite scrolling
        speed: 500, // Transition speed
        slidesToShow: 1, // Number of slides to show
        slidesToScroll: 1, // Number of slides to scroll at once
        autoplay: true, // Enable autoplay
        autoplaySpeed: 3000, // Speed of autoplay
        variableWidth: false, // Ensure all slides are uniform in width
    };
    

    return (
        <div className="home-container">
            <Slider {...settings}>
                <div className="carousel-image">
                    <img src={image1} alt="Elegant Sofa" />
                </div>
                <div className="carousel-image">
                    <img src={image2} alt="Comfortable Couch" />
                </div>
                <div className="carousel-image">
                    <img src={image4} alt="Classic Recliner" />
                </div>
                <div className="carousel-image">
                    <img src={image5} alt="Luxury Sofa Set" />
                </div>
            </Slider>
        </div>
    );
};

export default Home;
