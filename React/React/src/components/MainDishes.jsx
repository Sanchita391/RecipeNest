import React from "react";
import { Link } from "react-router-dom";
import "./MainDishes.css";

const mainDishes = [
  {
    id: 1,
    name: "Grilled Chicken",
    description: "Served with roasted vegetables and mashed potatoes.",
    image: "/images/maindish1.jpg",
  },
  {
    id: 2,
    name: "Beef Steak",
    description: "Juicy steak with garlic butter and herbs.",
    image: "/images/maindish5.avif",
  },
  {
    id: 3,
    name: "Vegetable Pasta",
    description: "Creamy pasta loaded with fresh vegetables.",
    image: "/images/maindish8.avif",
  },
  {
    id: 4,
    name: "Chicken Parmesan",
    description: "Breaded chicken with marinara sauce and melted cheese.",
    image: "/images/maindish6.avif",
  },
  {
    id: 5,
    name: "Salmon Fillet",
    description: "Pan-seared salmon with a lemon butter sauce.",
    image: "/images/maindish5.avif",
  },
  {
    id: 6,
    name: "Vegetarian Lasagna",
    description: "Layered lasagna with ricotta, spinach, and marinara sauce.",
    image: "/images/maindish6.avif",
  },
  {
    id: 7,
    name: "Lamb Chops",
    description: "Tender lamb chops with rosemary and garlic.",
    image: "/images/maindish7.avif",
  },
  {
    id: 8,
    name: "Spaghetti Bolognese",
    description: "Classic spaghetti with a rich meat sauce.",
    image: "/images/maindish8.avif",
  },
];

const MainDishes = () => {
  return (
    <div className="main-dish-container">
      {/* Main Dishes Section */}
      <section className="main-dishes-section">
        <h2 className="main-dish-title">Our Main Dishes</h2>
        <div className="dishes-list">
          {mainDishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <div className="dish-image-container">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="dish-image"
                />
              </div>
              <div className="dish-text">
                <h3 className="dish-name">{dish.name}</h3>
                <p className="dish-description">{dish.description}</p>
                {/* Modify this Link to redirect to the login page */}
                <Link to="/login" className="learn-more">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainDishes;
