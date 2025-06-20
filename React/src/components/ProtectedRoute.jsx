import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation(); // Get current location object

  // 1. Check for authentication token
  const token = localStorage.getItem('token');

  // 2. Check for user role
  const userRole = localStorage.getItem('role');

  // --- Debugging Logs (Very useful!) ---
  // Check these in your browser's console when navigating to a protected route
  console.log('--- ProtectedRoute Check ---');
  console.log('Location:', location.pathname);
  console.log('Required Role:', role);
  console.log('Token found:', !!token); // Use !! to convert to boolean for logging
  console.log('User Role found:', userRole);
  // --- End Debugging Logs ---

  // Check if the user is logged in
  if (!token) {
    // User not logged in, redirect to login page
    // Save the location they were trying to access using 'state'
    console.log('Redirecting to /login (No token)');
    return <Navigate to="/login" state={{ from: location }} replace />;
    // 'replace' avoids adding the login route to history when redirecting back
  }

  // Check if the logged-in user has the required role
  if (userRole !== role) {
    // User is logged in but doesn't have the correct role
    // Redirect to a safe page (e.g., homepage) to prevent unauthorized access
    // Avoid redirecting back to the *same* protected route or login page
    console.log(`Redirecting to / (Role mismatch: required ${role}, user has ${userRole})`);
    // You could create a dedicated '/unauthorized' page if preferred
    return <Navigate to="/" replace />;
  }

  // If token exists AND userRole matches the required role, render the child component
  console.log('Access Granted.');
  return children;
};

export default ProtectedRoute;