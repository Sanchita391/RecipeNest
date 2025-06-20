import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import HomeComponent from './components/HomeComponent';
import LoginComponent from './components/LoginComponent';
import SignupComponent from './components/SignupComponent';
import ChefsComponent from './components/ChefsComponent';
import RecipeComponent from './components/RecipeComponent';
import AboutComponent from './components/AboutComponent';
import GalleryComponent from './components/GalleryComponent';
import MainDishes from './components/MainDishes';
import FastFoodComponent from './components/FastFoodComponent';
import DessertComponent from './components/DessertComponent';
import ChefProfile from './components/ChefProfile';
import ChefdashboardComponent from './components/ChefdashboardComponent';
import AdmindashboardComponent from './components/AdmindashboardComponent';
import FoodLoverDashboardComponent from './components/FoodLoverDashboardComponent';
import ProtectedRoute from './components/ProtectedRoute'; // Auth wrapper

function App() {
  return (
    <Router>
      <NavbarComponent />
      <div className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeComponent />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/signup" element={<SignupComponent />} />
          <Route path="/chefs" element={<ChefsComponent />} />
          <Route path="/recipes" element={<RecipeComponent />} />
          <Route path="/about" element={<AboutComponent />} />
          <Route path="/gallery" element={<GalleryComponent />} />
          <Route path="/maindishes" element={<MainDishes />} />
          <Route path="/fastfood" element={<FastFoodComponent />} />
          <Route path="/dessert" element={<DessertComponent />} />
          <Route path="/chef-profile/:id" element={<ChefProfile />} />

          {/* Protected Routes */}
          <Route 
            path="/chef-dashboard" 
            element={
              <ProtectedRoute role="Chef">
                <ChefdashboardComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute role="Admin">
                <AdmindashboardComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/foodlover-dashboard" 
            element={
              <ProtectedRoute role="FoodLover">
                <FoodLoverDashboardComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
