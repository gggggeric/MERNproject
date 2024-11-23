// src/components/Home.js
import React from 'react';
import Slider from 'react-slick'; // Importing Slider from react-slick
import './Home.css'; // Importing CSS for the Home component
import image1 from '../photos/image1.jpg'; // Ensure this path is correct
import image2 from '../photos/image2.jpg';
import image4 from '../photos/image4.jpeg'; // Ensure this path is correct
import image5 from '../photos/image5.jpg';
import sofaImage from '../photos/sofa_image.jpg'; // Add an image for the "SofaSphere" store (example)
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
            {/* Carousel Section */}
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

            {/* About SofaSphere Section */}
            <div className="about-container">
                <h2>Welcome to SofaSphere!</h2>
                <p>
                    At SofaSphere, we believe that your sofa should not just be a piece of furniture, but the heart of your home.
                    Our expertly crafted sofas provide the perfect balance of comfort, style, and quality, ensuring that you find your perfect seat.
                </p>
                <div className="about-images">
                    <img src={sofaImage} alt="Sofa Display" className="about-image" />
                    <div className="about-text">
                        <h3>Why Choose SofaSphere?</h3>
                        <ul>
                            <li>High-quality materials for long-lasting comfort</li>
                            <li>Wide variety of designs to match any decor</li>
                            <li>Affordable prices without compromising quality</li>
                            <li>Fast and reliable delivery to your doorstep</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
