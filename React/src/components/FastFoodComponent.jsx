import React from "react";
import { Link } from "react-router-dom";
import "./FastFood.css";

const fastFoods = [
  {
    id: 1,
    name: "Cheeseburger",
    description: "A classic cheeseburger with fresh lettuce and tomato.",
    image: "/images/fastfood4.avif",
  },
  {
    id: 2,
    name: "Fries",
    description: "Crispy golden fries served with ketchup.",
    image: "/images/fastfood1.avif",
  },
  {
    id: 3,
    name: "Hot Dog",
    description: "Grilled hot dog served with mustard and relish.",
    image: "/images/fastfood2.avif",
  },
  {
    id: 4,
    name: "Chicken Nuggets",
    description: "Crispy chicken nuggets served with dipping sauce.",
    image: "/images/fastfood3.avif",
  },
  {
    id: 5,
    name: "Pizza Slice",
    description: "A cheesy slice of pepperoni pizza.",
    image: "/images/fastfood5.avif",
  },
  {
    id: 6,
    name: "Onion Rings",
    description: "Crispy onion rings served with dipping sauce.",
    image: "/images/fastfood6.avif",
  },
  {
    id: 7,
    name: "Chicken Sandwich",
    description: "Grilled chicken sandwich with lettuce and mayo.",
    image: "/images/fastfood7.avif",
  },
  {
    id: 8,
    name: "Milkshake",
    description: "A rich and creamy milkshake with your choice of flavor.",
    image: "/images/fastfood1.avif",
  },
];

const FastFoodComponent = () => {
  return (
    <div className="fast-food-container">
      <h2 className="section-title">Fast Foods</h2>
      <div className="food-list">
        {fastFoods.map((food) => (
          <div key={food.id} className="food-card">
            <img src={food.image} alt={food.name} className="food-image" />
            <h3 className="food-name">{food.name}</h3>
            <p className="food-description">{food.description}</p>
            {/* Update Link to navigate to /login */}
            <Link to="/login" className="learn-more">
              Learn More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FastFoodComponent;
