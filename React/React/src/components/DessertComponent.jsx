import React from "react";
import { Link } from "react-router-dom";
import "./Dessert.css";

const desserts = [
  {
    id: 1,
    name: "Chocolate Cake",
    description: "A rich and moist chocolate cake topped with creamy frosting.",
    image: "/images/dessert1.avif",
  },
  {
    id: 2,
    name: "Ice Cream Sundae",
    description: "A delicious sundae with vanilla ice cream, chocolate syrup, and a cherry.",
    image: "/images/dessert2.avif",
  },
  {
    id: 3,
    name: "Cheesecake",
    description: "A creamy cheesecake with a buttery graham cracker crust and fresh berries.",
    image: "/images/dessert3.avif",
  },
  {
    id: 4,
    name: "Fruit Tart",
    description: "A crisp tart filled with custard and topped with fresh fruits.",
    image: "/images/dessert4.avif",
  },
  {
    id: 5,
    name: "Cupcakes",
    description: "Fluffy vanilla cupcakes topped with sweet buttercream frosting.",
    image: "/images/dessert5.avif",
  },
  {
    id: 6,
    name: "Brownies",
    description: "Rich and fudgy brownies with a chocolatey, gooey center.",
    image: "/images/dessert6.avif",
  },
  {
    id: 7,
    name: "Panna Cotta",
    description: "A creamy Italian dessert served with a berry compote.",
    image: "/images/dessert7.avif",
  },
  {
    id: 8,
    name: "Tiramisu",
    description: "A classic Italian dessert made with layers of coffee-soaked ladyfingers and mascarpone cream.",
    image: "/images/dessert8.avif",
  },
];

const Dessert = () => {
  return (
    <div className="dessert-container">
      <h2 className="dessert-title">Delicious Desserts</h2>
      <div className="dessert-list">
        {desserts.map((dessert) => (
          <div key={dessert.id} className="dessert-card">
            <img
              src={dessert.image}
              alt={dessert.name}
              className="dessert-image"
            />
            <h3 className="dessert-name">{dessert.name}</h3>
            <p className="dessert-description">{dessert.description}</p>
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

export default Dessert;
