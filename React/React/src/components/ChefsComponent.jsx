import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./ChefsComponent.css";

const ChefsComponent = () => {
  const navigate = useNavigate();

  const chefs = [
    {
      name: "Mike Jordan",
      role: "Senior Chef",
      specialty: "Pizzaiolo",
      image: "images/chef4recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FFA500", // Orange
    },
    {
      name: "Elon Morgay",
      role: "Senior Chef",
      specialty: "Boulanger",
      image: "/images/chef2recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FFA500",
    },
    {
      name: "Dev Pasley",
      role: "Senior Chef",
      specialty: "Charcutier",
      image: "images/chef3recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FF4D6D",
    },
    {
      name: "Rose Jake",
      role: "Senior Chef",
      specialty: "Patissier",
      image: "images/chef4recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FF4D6D",
    },
    {
      name: "Rose Jake",
      role: "Senior Chef",
      specialty: "Saucier",
      image: "images/chef7recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FF4D6D",
    },
    {
      name: "Mike Jordan",
      role: "Senior Chef",
      specialty: "Garde Manger",
      image: "images/chef5recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FFA500",
    },
    {
      name: "Mike Jordan",
      role: "Senior Chef",
      specialty: "Garde Manger",
      image: "images/chef5recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FFA500",
    },
    {
      name: "Mike Jordan",
      role: "Senior Chef",
      specialty: "Garde Manger",
      image: "/images/Chef1recipenest.jpg",
      rating: "⭐⭐⭐⭐⭐",
      bgColor: "#FFA500",
    },
  ];

  return (
    <div className="chefs-section">
      <h1>Our Chefs for your help.</h1>
      <div className="chefs-container">
        {chefs.map((chef, index) => (
          <div key={index} className="chef-card">
            <div
              className="chef-image-container"
              style={{ backgroundColor: chef.bgColor }}
            >
              <img src={chef.image} alt={chef.name} className="chef-image" />
            </div>
            <div className="chef-details">
              <h3>{chef.name}</h3>
              <p className="role">{chef.role}</p>
              <p className="rating">{chef.rating}</p>
              <p className="specialty">{chef.specialty}</p>
              <button
                className="learn-more-button"
                onClick={() => navigate("/login")}
              >
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChefsComponent;
