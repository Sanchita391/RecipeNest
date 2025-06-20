import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GalleryComponent.css';

const GalleryComponent = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/login');
  };

  return (
    <div className="gallery-container">
      <h1>RecipeNest Gallery</h1>

      <h2>Our Favorite Dishes</h2>
      <div className="gallery-section">
        {[
          {
            image: "/images/food1.jpeg",
            title: "Spaghetti Carbonara",
            desc: "Classic Italian pasta dish with a creamy egg-based sauce and crispy pancetta.",
          },
          {
            image: "/images/food2.jpg",
            title: "Sushi Platter",
            desc: "Fresh and vibrant sushi rolls with a variety of fish and vegetables.",
          },
          {
            image: "/images/food3.jpg",
            title: "Grilled Chicken Salad",
            desc: "A healthy and flavorful salad with grilled chicken, greens, and a zesty vinaigrette.",
          },
          {
            image: "/images/food5.jpg",
            title: "Chocolate Lava Cake",
            desc: "Decadent dessert with a molten chocolate center, served warm with vanilla ice cream.",
          },
          {
            image: "/images/food4.jpg",
            title: "Grilled Chicken Salad",
            desc: "A healthy and flavorfual salad with grilled chicken, greens, and a zesty vinaigrette.",
          },
          {
            image: "/images/food2.jpg",
            title: "Sushi Platter",
            desc: "Fresh and vibrant sushi rolls with a variety of fish and vegetables.",
          },
          
          {
            image: "/images/food5.jpg",
            title: "Sushi Platter",
            desc: "Fresh and vibrant sushi rolls with a variety of fish and vegetables.",
          }, 

           {
            image: "/images/food3.jpg",
            title: "Sushi Platter",
            desc: "Fresh and vibrant sushi rolls with a variety of fish and vegetables.",
          }
          
        ].map((dish, index) => (
          <div className="gallery-item" key={index}>
            <img src={dish.image} alt={dish.title} />
            <h3>{dish.title}</h3>
            <p>{dish.desc}</p>
            <button className="learn-more-button" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryComponent;
