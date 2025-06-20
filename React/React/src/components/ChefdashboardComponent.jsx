// **************************************************************************
// ******    FULL REACT COMPONENT CODE (Separate Edit Recipe Section)    ******
// **************************************************************************

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ChefdashboardComponent.css"; // Ensure this path is correct

// Define the Base URL for the API
// VERIFY: Ensure this is the correct base URL where your ASP.NET Core API is running
const API_BASE_URL = "https://localhost:7092";
const REFRESH_INTERVAL_MS = 30000; // 30 seconds

// --- Helper Functions ---
const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
        stars.push(<span key={i} className={i <= roundedRating ? "star filled" : "star"}>★</span>);
    }
    return <div className="star-rating-display">{stars}</div>;
};

// Helper for constructing Image URLs
const getFullImageUrl = (relativePathOrUrl) => {
    if (!relativePathOrUrl) {
        return null; // No path provided
    }
    // Check if it's already an absolute URL
    if (relativePathOrUrl.startsWith('http://') || relativePathOrUrl.startsWith('https://')) {
        return relativePathOrUrl;
    }
    // Assume it's relative to the API base URL
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const relativePath = relativePathOrUrl.startsWith('/') ? relativePathOrUrl : `/${relativePathOrUrl}`;
    return `${basePath}${relativePath}`;
};


// --- Component ---
const ChefdashboardComponent = () => {
    // --- State ---
    const [chefDetails, setChefDetails] = useState(null);
    const [recipeFormData, setRecipeFormData] = useState({ recipeId: null, title: "", type: "", cuisine: "", description: "", ingredients: "", instructions: "", recipeImageFile: null });
    const [profileFormData, setProfileFormData] = useState({ name: "", email: "", password: "", roleTitle: "", specialty: "" });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [isLoadingChef, setIsLoadingChef] = useState(true);
    const [isLoadingMyRecipes, setIsLoadingMyRecipes] = useState(true);
    const [isLoadingAllRecipes, setIsLoadingAllRecipes] = useState(true);
    const [fetchChefError, setFetchChefError] = useState(null);
    const [fetchMyRecipesError, setFetchMyRecipesError] = useState(null);
    const [fetchAllRecipesError, setFetchAllRecipesError] = useState(null);
    const [viewingRecipe, setViewingRecipe] = useState(null);
    const [isLoadingRecipeDetail, setIsLoadingRecipeDetail] = useState(false);
    const [fetchRecipeDetailError, setFetchRecipeDetailError] = useState(null);
    const [activeSection, setActiveSection] = useState('home'); // Default section
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // --- Helper: Reset Recipe Form State ---
    const resetRecipeForm = useCallback(() => {
        console.log("DEBUG: Resetting recipe form state.");
        setRecipeFormData({ recipeId: null, title: "", type: "", cuisine: "", description: "", ingredients: "", instructions: "", recipeImageFile: null });
        const recipeFileInput = document.getElementById('recipeImageInput');
        if (recipeFileInput) recipeFileInput.value = '';
    }, []); // No dependencies needed


    // --- Handlers & Fetch Logic ---

    const handleLogout = useCallback(() => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token"); localStorage.removeItem("role"); navigate("/login");
        }
    }, [navigate]);

    // Generic API Call Function (Robust version from previous example)
    const callApi = useCallback(async (url, options = {}) => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken && !url.endsWith('/login') && !url.endsWith('/register')) {
             console.error("callApi: No token found for protected route, logging out.");
             handleLogout();
             return { success: false, error: "Authentication token missing. Please log in again.", status: 401 };
        }
        try {
            const effectiveOptions = { ...options, method: options.method || 'GET' };
            const headers = { ...(options.headers || {}), };

            if (currentToken) {
                headers['Authorization'] = `Bearer ${currentToken}`;
            }

            if (!(effectiveOptions.body instanceof FormData)) {
                 if (effectiveOptions.body && (typeof effectiveOptions.body === 'string' || typeof effectiveOptions.body === 'object') && !headers['Content-Type']) {
                     headers['Content-Type'] = 'application/json';
                 }
            }

            if (!headers['Accept']) { headers['Accept'] = 'application/json'; }


            const response = await fetch(url, { ...effectiveOptions, headers });

            if (response.status === 401 || response.status === 403) {
                console.error(`callApi: Authorization error (${response.status}) on ${url}. Logging out.`);
                handleLogout();
                return { success: false, error: `Authorization failed (${response.status}). Please log in again.`, status: response.status };
            }

            if (response.status === 204) {
                 console.log(`callApi: Received 204 No Content from ${url}.`);
                 return { success: true, data: null, status: response.status };
            }

            const contentType = response.headers.get("content-type");
            let data;
            let responseTextForError = "";

            try {
                 if (contentType && contentType.includes("application/json")) {
                    const text = await response.text();
                    if (text) { data = JSON.parse(text); }
                    else { data = null; if (!response.ok) { console.warn(`callApi: Received empty JSON response body with error status ${response.status} from ${url}`); } }
                 } else {
                     data = await response.text();
                     responseTextForError = data;
                     if (response.ok) { console.log(`callApi: Received non-JSON response from ${url}. Status: ${response.status}. Treating as text data.`); return { success: true, data: data, status: response.status }; }
                     else { console.warn(`callApi: Received non-JSON error response from ${url}. Content-Type: ${contentType}, Status: ${response.status}. Body snippet: ${responseTextForError.substring(0, 150)}`); }
                 }
            } catch (parseError) {
                console.error(`callApi: Error parsing response from ${url}:`, parseError);
                if (!response.ok) {
                    const errorDetail = responseTextForError ? `: ${responseTextForError.substring(0,150)}` : '';
                    return { success: false, error: `Request failed (${response.status}) and response parsing failed${errorDetail}.`, status: response.status };
                }
                console.warn(`callApi: Response from ${url} was OK (${response.status}) but failed to parse. Content-Type: ${contentType}`);
                return { success: true, data: null, status: response.status, warning: 'Response parsing failed' };
            }

            if (!response.ok) {
                let errorMsg = `Request failed: ${response.status}`;
                if (typeof data === 'object' && data !== null) { errorMsg = data.message || data.title || data.error || (Object.keys(data).length > 0 ? JSON.stringify(data) : errorMsg); }
                else if (responseTextForError && responseTextForError.length > 0 && responseTextForError.length < 500 && errorMsg !== responseTextForError) { errorMsg = responseTextForError; }
                else if (typeof data === 'string' && data.length > 0 && data.length < 500 && errorMsg !== data && data !== responseTextForError) { errorMsg = data; }
                console.error(`callApi: API Error (${response.status}) on ${url}. Message: ${errorMsg}`);
                return { success: false, error: errorMsg, status: response.status };
            }
            return { success: true, data, status: response.status };

        } catch (error) {
            console.error(`callApi: Network or execution error calling ${url}: ${error.message}`, error);
            let errorMessage = "Network error or the server could not be reached.";
            if (error instanceof TypeError && error.message.includes('fetch')) { errorMessage = "Network error: Could not connect to the server. Is the API running?"; }
            else if (error instanceof DOMException && error.name === 'AbortError') { errorMessage = "The request was aborted."; }
            return { success: false, error: errorMessage, status: null };
        }
    }, [handleLogout]);

    const fetchChefDetails = useCallback(async () => {
        setIsLoadingChef(true); setFetchChefError(null);
        const res = await callApi(`${API_BASE_URL}/api/Users/me`); // OK
        if (res.success && res.data) {
            setChefDetails(res.data);
             if (!profileFormData.name || activeSection === 'manage-profile') {
                setProfileFormData(prev => ({
                    ...prev,
                    name: res.data.name || "",
                    email: res.data.email || "",
                    password: "",
                    roleTitle: res.data.roleTitle || "",
                    specialty: res.data.specialty || ""
                }));
            }
        } else { setFetchChefError(`Failed to load profile: ${res.error || 'No data received'}`); setChefDetails(null); }
        setIsLoadingChef(false);
    }, [callApi, activeSection, profileFormData.name]);

    const fetchMyRecipes = useCallback(async (isPolling = false) => {
        if (!isPolling) { setIsLoadingMyRecipes(true); setFetchMyRecipesError(null); }
        const res = await callApi(`${API_BASE_URL}/api/recipes/my-recipes`); // OK
        if (res.success && Array.isArray(res.data)) {
             setMyRecipes(res.data);
             if (!isPolling || fetchMyRecipesError) setFetchMyRecipesError(null);
        } else {
             const errorMsg = `Failed to load your recipes: ${res.error || 'Data format error'}`;
             if (!isPolling || fetchMyRecipesError !== errorMsg) { setFetchMyRecipesError(errorMsg); }
             if (!isPolling) setMyRecipes([]);
        }
        if (!isPolling) setIsLoadingMyRecipes(false);
    }, [callApi, fetchMyRecipesError]);

    const fetchAllRecipes = useCallback(async () => {
        setIsLoadingAllRecipes(true); setFetchAllRecipesError(null);
        const res = await callApi(`${API_BASE_URL}/api/recipes`); // OK
        if (res.success && Array.isArray(res.data)) { setAllRecipes(res.data); }
        else { setFetchAllRecipesError(`Failed to load public recipes: ${res.error || 'Data format error'}`); setAllRecipes([]); }
        setIsLoadingAllRecipes(false);
    }, [callApi]);

    // *** MODIFIED NAVIGATION HANDLER ***
    const handleNavClickUnified = useCallback((section) => {
        console.log(`DEBUG: Navigating to section: ${section}`);
        setActiveSection(prevActiveSection => {
            // Clear recipe form state if navigating AWAY from add or edit sections
            if ((prevActiveSection === 'add-recipe' || prevActiveSection === 'edit-recipe') &&
                section !== 'add-recipe' && section !== 'edit-recipe') {
                console.log(`DEBUG: Clearing recipe form state as navigating away from ${prevActiveSection} to ${section}.`);
                resetRecipeForm();
            }
            return section; // Update the active section state
        });

        setViewingRecipe(null); // Always clear viewing recipe on section change
        setFetchRecipeDetailError(null);

        if (section === 'manage-profile') {
            if (chefDetails) {
                 setProfileFormData(prev => ({
                    ...prev, name: chefDetails.name || "", email: chefDetails.email || "", password: "",
                    roleTitle: chefDetails.roleTitle || "", specialty: chefDetails.specialty || ""
                 }));
            } else {
                console.warn("DEBUG: chefDetails not loaded yet when navigating to profile.");
                if (!isLoadingChef) fetchChefDetails();
            }
            setProfileImageFile(null);
            const fileInput = document.getElementById('profileImageFile');
            if (fileInput) fileInput.value = '';
        }
        // Clearing form for 'add-recipe' is handled by the specific navbar button click handler now.
        window.scrollTo(0, 0);
    }, [chefDetails, fetchChefDetails, isLoadingChef, resetRecipeForm]); // Added resetRecipeForm

    const handleViewRecipe = useCallback(async (recipeId) => {
        if (!recipeId) return;
        console.log(`Fetching details for recipe ID: ${recipeId}`);
        setActiveSection('view-detail'); setIsLoadingRecipeDetail(true); setFetchRecipeDetailError(null); setViewingRecipe(null);
        const result = await callApi(`${API_BASE_URL}/api/recipes/${recipeId}`); // OK
        if (result.success && result.data) { setViewingRecipe(result.data); }
        else { setFetchRecipeDetailError(`Failed to load recipe details: ${result.error || 'No data received'}`); }
        setIsLoadingRecipeDetail(false);
    }, [callApi]);

    const handleCloseRecipeView = useCallback(() => {
        setViewingRecipe(null); setFetchRecipeDetailError(null); setActiveSection('my-recipes');
    }, []);

     // *** MODIFIED EDIT HANDLER ***
     const handleEditRecipe = useCallback((recipe) => {
        if (!recipe) return;
        console.log("Setting form data and navigating to 'edit-recipe' for ID:", recipe.id);
        setRecipeFormData({ // Set state WITH recipeId
            recipeId: recipe.id,
            title: recipe.title || "",
            type: recipe.type || "",
            cuisine: recipe.cuisine || "",
            description: recipe.description || "",
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : (recipe.ingredients || ""),
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : (recipe.instructions || ""),
            recipeImageFile: null
        });
        const fileInput = document.getElementById('recipeImageInput');
        if (fileInput) fileInput.value = '';
        // Navigate to the new 'edit-recipe' section
        setActiveSection('edit-recipe'); // Directly set the active section
        window.scrollTo(0, 0); // Scroll to top
    }, []); // Removed handleNavClickUnified dependency

     const handleInputChange = useCallback((e) => {
        const { name, value, type, files, form } = e.target;
        const formId = form?.id;

        if (name === 'profileImageFile' && type === 'file' && files) {
             console.log("DEBUG: Profile image file selected:", files[0]?.name);
             setProfileImageFile(files[0] || null);
        } else if (formId === 'update-profile-form') {
             setProfileFormData(prev => ({ ...prev, [name]: value }));
        } else if (formId === 'add-edit-recipe-form' && name === 'recipeImageInput' && type === 'file' && files) {
             console.log("DEBUG: Recipe image file selected:", files[0]?.name);
             setRecipeFormData(prev => ({ ...prev, recipeImageFile: files[0] || null }));
        } else if (formId === 'add-edit-recipe-form') {
             setRecipeFormData(prev => ({ ...prev, [name]: value }));
        } else {
             console.warn(`Input change detected for name "${name}" outside tracked forms or unhandled input type. Form ID: ${formId}`);
        }
    }, []);


    // --- Action Handlers (Submit, Delete, Upload) ---

    const handleAddOrUpdateRecipe = useCallback(async (e) => {
        e.preventDefault();
        console.log("DEBUG: Submitting Add/Update Recipe.", recipeFormData);
        const { recipeId, title, type, cuisine, description, ingredients, instructions, recipeImageFile } = recipeFormData;
        const isUpdating = !!recipeId;

        const url = isUpdating ? `${API_BASE_URL}/api/recipes/${recipeId}` : `${API_BASE_URL}/api/recipes`; // OK
        const method = isUpdating ? 'PUT' : 'POST'; // OK
        let result;

        try {
            const formData = new FormData();
            formData.append('Title', title);
            formData.append('Type', type);
            formData.append('Cuisine', cuisine);
            formData.append('Description', description);
            formData.append('Ingredients', ingredients);
            formData.append('Instructions', instructions);

            if (!isUpdating && recipeImageFile instanceof File) {
                formData.append('Image', recipeImageFile, recipeImageFile.name);
                console.log(`DEBUG: Appending recipe image '${recipeImageFile.name}' to FormData for POST using field name 'Image'.`);
            } else if (!isUpdating) {
                console.log("DEBUG: No recipe image file selected for new recipe POST upload.");
            }

            console.log(`DEBUG: Sending ${method} request to ${url} using FormData.`);
            result = await callApi(url, { method, body: formData });
            console.log("DEBUG: Add/Update Recipe API Response:", result);

            if (result.success) {
                alert(`Recipe ${isUpdating ? 'updated' : 'added'} successfully!`);
                resetRecipeForm(); // Clear form state using helper
                await fetchMyRecipes();
                handleNavClickUnified('my-recipes'); // Navigate back to list
            } else {
                alert(`Failed to ${isUpdating ? 'update' : 'add'} recipe: ${result.error || 'Unknown error'} (Status: ${result.status})`);
            }
        } catch (error) {
            console.error(`Error during recipe ${isUpdating ? 'update' : 'add'}:`, error);
            alert(`An unexpected error occurred while ${isUpdating ? 'updating' : 'adding'} the recipe.`);
        }
    }, [recipeFormData, callApi, fetchMyRecipes, handleNavClickUnified, resetRecipeForm]); // Added resetRecipeForm

    const handleDeleteRecipe = useCallback(async (id) => {
        if (!id || !window.confirm("Are you sure you want to delete this recipe?")) return;
        console.log("DEBUG: Attempting to delete recipe ID:", id);
        const url = `${API_BASE_URL}/api/recipes/${id}`; // OK
        const method = "DELETE"; // OK
        try {
            const result = await callApi(url, { method });
            console.log("DEBUG: Delete Recipe API Response:", result);
            if (result.success || result.status === 204) {
                alert("Recipe deleted successfully.");
                await fetchMyRecipes();
                // If the currently viewed/edited recipe was deleted, clear state and navigate
                if (activeSection === 'view-detail' && viewingRecipe?.id === id) {
                    handleNavClickUnified('my-recipes');
                } else if (activeSection === 'edit-recipe' && recipeFormData.recipeId === id) { // Check against edit-recipe section
                     resetRecipeForm(); // Clear form
                     handleNavClickUnified('my-recipes'); // Navigate away
                }
            } else {
                alert(`Failed to delete recipe: ${result.error || 'Unknown error'} (Status: ${result.status})`);
            }
        } catch (error) {
            console.error("Error during recipe deletion:", error);
            alert("An unexpected error occurred while deleting the recipe.");
        }
    }, [callApi, fetchMyRecipes, viewingRecipe, activeSection, handleNavClickUnified, recipeFormData.recipeId, resetRecipeForm]); // Added resetRecipeForm

    const handleUpdateProfile = useCallback(async (e) => {
        e.preventDefault();
        console.log("DEBUG: Submitting Update Profile.", profileFormData);
        const { name, email, password, roleTitle, specialty } = profileFormData;

        const payload = { Name: name, Email: email, RoleTitle: roleTitle, Specialty: specialty };
        if (password && password.trim() !== "") {
             payload.Password = password.trim();
             console.log("DEBUG: Non-empty password included in update payload.");
        } else {
             console.log("DEBUG: Password field empty or whitespace, not included in update payload.");
        }

        const url = `${API_BASE_URL}/api/Users/me`; // OK
        const method = "PUT"; // OK
        console.log(`DEBUG: Sending ${method} request to ${url} with JSON payload:`, payload);

        try {
            const result = await callApi(url, {
                 method,
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
            });
            console.log("DEBUG: Update Profile API Response:", result);

            if (result.success || result.status === 204) {
                 alert("Profile updated successfully!");
                 await fetchChefDetails();
                 setProfileFormData(prev => ({ ...prev, password: "" }));
            } else {
                 const errorMsg = result.status === 404
                     ? `Profile update failed: Endpoint not found at ${url}. Verify the API route and method (PUT).`
                     : `Profile update failed: ${result.error || 'Unknown error'} (Status: ${result.status})`;
                 alert(errorMsg);
            }
        } catch (error) {
            console.error("Error during profile update:", error);
            alert("An unexpected error occurred while updating the profile.");
        }
    }, [profileFormData, callApi, fetchChefDetails]);


    const handleUploadProfileImage = useCallback(async () => {
        if (!profileImageFile) { alert("Please select an image file first."); return; }
        if (!(profileImageFile instanceof File)) { alert("Invalid file selected. Please select an image file."); return; }

        const formData = new FormData();
        const formDataKey = 'image';
        formData.append(formDataKey, profileImageFile, profileImageFile.name);
        console.log(`DEBUG: Appending profile image '${profileImageFile.name}' to FormData using key '${formDataKey}'.`);

        const url = `${API_BASE_URL}/api/Users/me/profile-image`;
        const method = "PUT";

        console.log(`DEBUG: Uploading profile picture via ${method} to ${url}`);

        try {
            const result = await callApi(url, { method, body: formData });
            console.log("DEBUG: Upload Profile Picture API Response:", result);

            if (result.success) {
                alert(result.data?.message || "Profile picture updated successfully!");
                await fetchChefDetails();
                setProfileImageFile(null);
                const fileInput = document.getElementById('profileImageFile');
                if (fileInput) fileInput.value = '';
            } else {
                 const errorMsg = result.status === 404
                    ? `Upload failed: Endpoint not found at ${url}. Verify API base URL and route.`
                    : `Failed to upload profile picture: ${result.error || 'Unknown error'} (Status: ${result.status})`;
                 alert(errorMsg);
            }
        } catch (error) {
            console.error("Error during profile picture upload:", error);
            alert("An unexpected error occurred while uploading the profile picture.");
        }
    }, [profileImageFile, callApi, fetchChefDetails]);


    // --- Effects ---
    useEffect(() => {
        const currentToken = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (currentToken && role === "Chef") {
            console.log("Mounting - Chef role confirmed. Fetching Initial Data");
            setIsLoadingChef(true);
            setIsLoadingMyRecipes(true);
            setIsLoadingAllRecipes(true);
            Promise.allSettled([
                fetchChefDetails(),
                fetchMyRecipes(),
                fetchAllRecipes()
            ]).then((results) => {
                console.log("Initial data fetch attempts completed.");
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.error(`Initial fetch failed for index ${index}:`, result.reason);
                    }
                });
            });
        } else {
            console.warn("No valid token or not Chef role found on mount, redirecting to login.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    useEffect(() => {
        const currentToken = localStorage.getItem("token");
        const shouldPoll = currentToken && (activeSection === 'my-recipes' || activeSection === 'home');

        if (!shouldPoll) {
            return;
        }

        console.log(`Setting up polling for my-recipes (interval: ${REFRESH_INTERVAL_MS}ms).`);
        const intervalId = setInterval(() => {
            console.log("Polling: Fetching my-recipes...");
            fetchMyRecipes(true);
        }, REFRESH_INTERVAL_MS);

        return () => {
            console.log("Clearing polling interval for my-recipes.");
            clearInterval(intervalId);
        };
    }, [token, activeSection, fetchMyRecipes]);


    // --- UI Rendering Logic ---
     const renderRecipeDetailView = useCallback(() => {
         if (isLoadingRecipeDetail) return <div className="recipe-detail-view loading-container"><p><i className="fas fa-spinner fa-spin"></i> Loading recipe details...</p></div>;
         if (fetchRecipeDetailError) return <div className="recipe-detail-view error-container"><button onClick={handleCloseRecipeView} className="button-back"><i className="fas fa-arrow-left"></i> Back</button><p><strong>Error:</strong> {fetchRecipeDetailError}</p></div>;
         if (!viewingRecipe) return <div className="recipe-detail-view info-container"><button onClick={handleCloseRecipeView} className="button-back"><i className="fas fa-arrow-left"></i> Back</button><p>Recipe details could not be displayed or no recipe selected.</p></div>;

         const imageUrl = getFullImageUrl(viewingRecipe.imageUrl);
         const averageRating = viewingRecipe.averageRating ?? 0;
         const isOwnRecipe = viewingRecipe?.chefId === chefDetails?.id;

         return (
             <div className="recipe-detail-view dashboard-section">
                 <button onClick={handleCloseRecipeView} className="button-back"><i className="fas fa-arrow-left"></i> Back to List</button>
                 <h3><i className="fas fa-book-reader"></i> Recipe Details</h3>
                 <div className="recipe-detail-content-wrapper card">
                     <div className="recipe-detail-header"><h4>{viewingRecipe.title || 'Untitled Recipe'}</h4><span className="recipe-id-display">(ID: {viewingRecipe.id})</span></div>
                     <div className="recipe-detail-body">
                         <div className="recipe-detail-image-container">
                             {imageUrl ? (
                                <img src={imageUrl} alt={viewingRecipe.title || 'Recipe image'} className="recipe-detail-image"
                                     onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.parentElement.classList.add('image-error'); }}
                                />
                              ) : null }
                              <div className="recipe-detail-image-placeholder"><i className="fas fa-image"></i> <span>{imageUrl ? 'Image Error' : 'No Image Available'}</span></div>
                         </div>
                         <div className="recipe-detail-text">
                             <p><strong>Chef:</strong> {viewingRecipe.chefName || 'N/A'}</p>
                             <p><strong>Type:</strong> {viewingRecipe.type || 'N/A'}</p>
                             <p><strong>Cuisine:</strong> {viewingRecipe.cuisine || 'N/A'}</p>
                             <div className="rating-section"><strong>Rating:</strong> {renderStars(averageRating)} {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : '(Not Rated)'}</div>
                             <p><strong>Views:</strong> {viewingRecipe.viewCount ?? 0}</p>
                             <p><strong>Description:</strong> {viewingRecipe.description || 'No description provided.'}</p>
                             <div className="recipe-detail-section">
                                 <h5><i className="fas fa-carrot"></i> Ingredients:</h5>
                                 <pre className="recipe-detail-preformatted">
                                     {typeof viewingRecipe.ingredients === 'string' && viewingRecipe.ingredients.trim() ? viewingRecipe.ingredients : 'Not specified.'}
                                 </pre>
                             </div>
                             <div className="recipe-detail-section">
                                 <h5><i className="fas fa-list-ol"></i> Instructions:</h5>
                                 <pre className="recipe-detail-preformatted">
                                     {typeof viewingRecipe.instructions === 'string' && viewingRecipe.instructions.trim() ? viewingRecipe.instructions : 'Not specified.'}
                                </pre>
                            </div>
                         </div>
                     </div>
                     {/* Only show Edit/Delete if it's the chef's own recipe */}
                     {isOwnRecipe && (
                         <div className="recipe-detail-actions content-actions">
                             <button onClick={() => handleEditRecipe(viewingRecipe)} className="button-edit action-button"><i className="fas fa-pencil-alt"></i> Edit This Recipe</button>
                             <button onClick={() => handleDeleteRecipe(viewingRecipe.id)} className="button-delete action-button"><i className="fas fa-trash-alt"></i> Delete This Recipe</button>
                         </div>
                     )}
                 </div>
             </div>
         );
     }, [viewingRecipe, isLoadingRecipeDetail, fetchRecipeDetailError, handleCloseRecipeView, handleEditRecipe, handleDeleteRecipe, chefDetails]); // Added chefDetails dependency

    // *** NEW: Reusable Form Rendering Function ***
    const renderRecipeForm = useCallback((isEditingMode) => {
        const isEditing = isEditingMode; // Use the passed argument

        return (
            <div className={`recipe-form-section dashboard-section ${isEditing ? 'editing-recipe' : ''}`}>
                <h3>
                    <i className={`fas ${isEditing ? 'fa-pencil-alt' : 'fa-utensils'}`}></i>
                    {isEditing ? `Edit Recipe (ID: ${recipeFormData.recipeId})` : 'Add New Recipe'}
                </h3>
                <form id="add-edit-recipe-form" onSubmit={handleAddOrUpdateRecipe} className="dashboard-form add-recipe-form card">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="recipe-title"><i className="fas fa-tag"></i> Title</label>
                            <input id="recipe-title" name="title" value={recipeFormData.title} onChange={handleInputChange} required maxLength={100} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="recipe-type"><i className="fas fa-utensil-spoon"></i> Type</label>
                            <input id="recipe-type" name="type" value={recipeFormData.type} onChange={handleInputChange} placeholder="e.g., Appetizer, Main, Dessert" required maxLength={50}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="recipe-cuisine"><i className="fas fa-globe-americas"></i> Cuisine</label>
                            <input id="recipe-cuisine" name="cuisine" value={recipeFormData.cuisine} onChange={handleInputChange} placeholder="e.g., Italian, Mexican, Indian" required maxLength={50}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="recipe-description"><i className="fas fa-info-circle"></i> Description</label>
                        <textarea id="recipe-description" name="description" value={recipeFormData.description} onChange={handleInputChange} required rows={3} maxLength={500}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="recipe-ingredients"><i className="fas fa-carrot"></i> Ingredients</label>
                        <textarea id="recipe-ingredients" name="ingredients" value={recipeFormData.ingredients} onChange={handleInputChange} required placeholder={"Example:\n1 cup flour\n2 large eggs, beaten\n1 tsp vanilla extract"} rows={6}/>
                        <small>Enter each ingredient on a new line.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="recipe-instructions"><i className="fas fa-list-ol"></i> Instructions</label>
                        <textarea id="recipe-instructions" name="instructions" value={recipeFormData.instructions} onChange={handleInputChange} required placeholder={"Example:\n1. Preheat oven to 350°F (175°C).\n2. Mix dry ingredients...\n3. Gradually add wet ingredients..."} rows={8}/>
                        <small>Enter each step on a new line or as numbered steps.</small>
                    </div>

                    {!isEditing && (
                        <div className="form-group">
                            <label htmlFor="recipeImageInput"><i className="fas fa-image"></i> Recipe Image (Optional)</label>
                            <input
                                id="recipeImageInput"
                                type="file"
                                name="recipeImageInput"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleInputChange}
                            />
                            {recipeFormData.recipeImageFile && <p className="file-selected-info info-subtle">Selected: {recipeFormData.recipeImageFile.name}</p>}
                        </div>
                    )}
                    {isEditing && (
                        <p className="info-subtle"><i className="fas fa-info-circle"></i> Image cannot be updated through this edit form.</p>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="form-button primary-button">
                            <i className={isEditing ? "fas fa-save" : "fas fa-plus"}></i> {isEditing ? 'Update Recipe' : 'Add Recipe'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetRecipeForm(); // Explicitly clear form on cancel
                                handleNavClickUnified('my-recipes'); // Navigate back
                            }}
                            className="form-button cancel-button"
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }, [recipeFormData, handleAddOrUpdateRecipe, handleInputChange, handleNavClickUnified, resetRecipeForm]); // Dependencies for the form

     // *** MODIFIED MAIN RENDERER ***
     const renderContent = useCallback(() => {
        // Handle states outside the switch first
        if (activeSection === 'view-detail') return renderRecipeDetailView();
        if (isLoadingChef && !chefDetails) return <div className="loading-container"><p><i className="fas fa-spinner fa-spin"></i> Initializing Dashboard...</p></div>;
        if (fetchChefError && !chefDetails) return <div className="error-container"><p><strong>Error:</strong> Could not initialize dashboard ({fetchChefError}). Please try <button onClick={() => window.location.reload()} className="button-link-styled">refreshing</button> or logging out and back in.</p></div>;
        if (!chefDetails && !['view-all', 'home', 'my-recipes'].includes(activeSection)) {
             return <div className="error-container"><p>Cannot display section '{activeSection}': Chef details are unavailable. Error: {fetchChefError || 'Unknown'}</p></div>;
        }

        try {
            switch (activeSection) {
                case 'home': {
                     const welcomeName = chefDetails?.name || 'Chef';
                     const recipeCount = myRecipes?.length ?? 0;
                     const recipeCountText = isLoadingMyRecipes ? '...' : (fetchMyRecipesError ? 'Error' : recipeCount);
                     const profilePicUrl = getFullImageUrl(chefDetails?.profilePictureUrl);
                    return (
                         <div className="chef-home-section dashboard-section">
                            <div className="chef-home-overview card">
                                <h3><i className="fas fa-tachometer-alt"></i> Dashboard</h3>
                                <p>Welcome back, <strong>{welcomeName}</strong>!</p>
                                <p>Manage your culinary creations and profile settings.</p>
                                <h4>Quick Stats</h4>
                                <div className="chef-quick-stats">
                                    <div className="stat-card">
                                        <span className="stat-icon"><i className="fas fa-book"></i></span>
                                        <span className="stat-number">{recipeCountText}</span>
                                        <span className="stat-label">Your Recipes</span>
                                        {fetchMyRecipesError && !isLoadingMyRecipes && <span className="stat-error-indicator" title={`Error loading recipes: ${fetchMyRecipesError}`}>!</span>}
                                    </div>
                                </div>
                                {fetchMyRecipesError && !isLoadingMyRecipes && <p className="error-message info-subtle"><i className="fas fa-exclamation-triangle"></i> Couldn't load current recipe stats.</p> }
                                <h4>Quick Actions</h4>
                                <div className="quick-actions">
                                    {/* Ensure this button clears the form before navigating */}
                                    <button onClick={() => {
                                        resetRecipeForm();
                                        handleNavClickUnified('add-recipe');
                                    }} className="button secondary-button"><i className="fas fa-plus"></i> Add New Recipe</button>
                                    <button onClick={() => handleNavClickUnified('my-recipes')} className="button secondary-button"><i className="fas fa-list"></i> View My Recipes</button>
                                </div>
                            </div>
                            <div className="chef-profile-summary card clickable" onClick={() => handleNavClickUnified('manage-profile')} title="Click to Manage Profile">
                                <h4><i className="fas fa-user"></i> Profile Summary</h4>
                                <div className="chef-profile-image-container">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt={`${welcomeName}'s profile`} className="chef-dashboard-profile-image"
                                                onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.parentElement.classList.add('image-error'); }}
                                        />
                                    ) : (
                                        <div className="chef-dashboard-profile-placeholder"><i className="fas fa-user"></i></div>
                                    )}
                                        <div className="chef-dashboard-profile-placeholder-fallback"><i className="fas fa-user"></i></div>
                                </div>
                                <p><strong>Name:</strong> {welcomeName}</p>
                                <p><strong>Role:</strong> {chefDetails?.roleTitle || 'N/A'}</p>
                                <p><strong>Specialty:</strong> {chefDetails?.specialty || 'N/A'}</p>
                                <span className="button-link-styled">Manage Profile <i className="fas fa-arrow-right"></i></span>
                            </div>
                         </div>);
                }
                case 'manage-profile': {
                    // ... (profile rendering code remains the same) ...
                     if (!chefDetails && isLoadingChef) return <div className="loading-container"><p><i className="fas fa-spinner fa-spin"></i> Loading profile details...</p></div>;
                     if (!chefDetails) return <div className="error-container"><p><strong>Error:</strong> Could not load profile details. {fetchChefError}</p></div>;
                      const currentProfilePicUrl = getFullImageUrl(chefDetails?.profilePictureUrl);
                     return (
                         <div className="profile-management-section dashboard-section">
                             <h3><i className="fas fa-user-cog"></i> Manage Profile</h3>
                             <div className="profile-forms-container">
                                 <form id="update-profile-form" onSubmit={handleUpdateProfile} className="dashboard-form update-profile-form card">
                                     <h4><i className="fas fa-user-edit"></i> Update Information</h4>
                                     <div className="form-group">
                                         <label htmlFor="profile-name"><i className="fas fa-user"></i> Name</label>
                                         <input id="profile-name" name="name" value={profileFormData.name} onChange={handleInputChange} required />
                                     </div>
                                     <div className="form-group">
                                         <label htmlFor="profile-email"><i className="fas fa-envelope"></i> Email</label>
                                         <input id="profile-email" name="email" type="email" value={profileFormData.email} onChange={handleInputChange} required />
                                     </div>
                                     <div className="form-group">
                                         <label htmlFor="profile-password"><i className="fas fa-key"></i> New Password</label>
                                         <input id="profile-password" name="password" type="password" value={profileFormData.password} onChange={handleInputChange} placeholder="Leave blank to keep current" autoComplete="new-password" />
                                         <small>Only enter if you want to change your password.</small>
                                     </div>
                                     <div className="form-group">
                                         <label htmlFor="profile-roleTitle"><i className="fas fa-id-badge"></i> Role Title</label>
                                         <input id="profile-roleTitle" name="roleTitle" value={profileFormData.roleTitle} onChange={handleInputChange} required />
                                     </div>
                                     <div className="form-group">
                                         <label htmlFor="profile-specialty"><i className="fas fa-star"></i> Specialty</label>
                                         <input id="profile-specialty" name="specialty" value={profileFormData.specialty} onChange={handleInputChange} required />
                                     </div>
                                     <div className="form-actions">
                                         <button type="submit" className="form-button primary-button"><i className="fas fa-save"></i> Save Profile Changes</button>
                                     </div>
                                 </form>
                                 <div className="profile-upload-section-form card">
                                     <h4><i className="fas fa-camera"></i> Profile Picture</h4>
                                     <div className="profile-image-preview-container">
                                         <span>Current:</span>
                                         {currentProfilePicUrl ? (
                                             <img src={currentProfilePicUrl} alt="Current profile" className="current-profile-image-preview"
                                                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="error-message info-subtle">(Image Error)</span>'; }}/>
                                         ) : (
                                              <p className="info-subtle">No profile picture currently set.</p>
                                         )}
                                     </div>
                                     <div className="form-group">
                                         <label htmlFor="profileImageFile"><i className="fas fa-image"></i> Upload New Image:</label>
                                         <input
                                             id="profileImageFile"
                                             type="file"
                                             name="profileImageFile"
                                             accept="image/png, image/jpeg, image/gif, image/webp" // Match backend allowed types
                                             onChange={handleInputChange}
                                         />
                                         {profileImageFile && <p className="file-selected-info info-subtle">Selected: {profileImageFile.name}</p>}
                                     </div>
                                     <div className="form-actions">
                                         <button
                                             type="button"
                                             onClick={handleUploadProfileImage} // Calls the FIXED function
                                             disabled={!profileImageFile}
                                             className="form-button profile-upload-button"
                                         >
                                             <i className="fas fa-upload"></i> Upload New Picture
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>);
                }
                // *** ADD RECIPE CASE NOW USES THE RENDER FUNCTION ***
                case 'add-recipe': {
                    // Check if trying to access add when editing - redirect might be better?
                    // Or just rely on navbar/buttons to clear state before setting this section.
                    if (recipeFormData.recipeId) {
                        console.warn("Attempted to render 'add-recipe' section while recipeFormData has an ID. Rendering edit form instead.");
                        return renderRecipeForm(true); // Render edit form as a fallback
                    }
                    return renderRecipeForm(false); // Render add form
                }
                // *** NEW CASE FOR EDIT RECIPE ***
                case 'edit-recipe': {
                    // Ensure we actually have a recipe ID to edit
                    if (!recipeFormData.recipeId) {
                        console.warn("Attempted to render 'edit-recipe' section without a recipe ID in form state. Redirecting to My Recipes.");
                        // Optionally navigate away gracefully
                        // setTimeout(() => handleNavClickUnified('my-recipes'), 0);
                        return <div className="info-container"><p>No recipe selected for editing. Redirecting...</p></div>;
                    }
                    return renderRecipeForm(true); // Render edit form
                }
                 case 'view-all': {
                     // ... (view-all rendering code remains the same) ...
                      if (isLoadingAllRecipes) return <div className="loading-container"><p><i className="fas fa-spinner fa-spin"></i> Loading all public recipes...</p></div>;
                      if (fetchAllRecipesError) return <div className="error-container dashboard-section"><h2><i className="fas fa-book-open"></i> All Public Recipes</h2><p><strong>Error:</strong> {fetchAllRecipesError}</p></div>;
                      if (!Array.isArray(allRecipes) || allRecipes.length === 0) return <div className="info-container dashboard-section"><h2><i className="fas fa-book-open"></i> All Public Recipes</h2><p>No public recipes found at the moment.</p></div>;
                      return (
                         <div className="view-all-section dashboard-section">
                             <h2><i className="fas fa-book-open"></i> All Public Recipes ({allRecipes.length})</h2>
                             <div className="recipe-list view-all-list">
                                 {allRecipes.map((recipe) => {
                                     const imageUrl = getFullImageUrl(recipe.imageUrl);
                                     const averageRating = recipe.averageRating ?? 0;
                                     const isMyRecipe = recipe.chefId === chefDetails?.id;
                                     return (
                                         <div key={`all-${recipe.id}`} className={`recipe-card ${isMyRecipe ? 'editable' : 'view-only'} card`}>
                                             <div className="recipe-image-container">
                                                 {imageUrl ? (
                                                     <img src={imageUrl} alt={recipe.title || 'Recipe'} className="recipe-image" onError={(e)=>{e.target.onerror=null; e.target.style.display='none'; e.target.parentElement.classList.add('image-error'); }} />
                                                 ) : null }
                                                 <div className="recipe-image-placeholder"><i className="fas fa-image"></i><span>{imageUrl ? 'Image Error' : 'No Image'}</span></div>
                                             </div>
                                             <div className="recipe-content-container">
                                                 <h4>{recipe.title || 'Untitled'} {isMyRecipe && <span className="my-recipe-badge">(Your Recipe)</span>}</h4>
                                                 <div className="recipe-meta">
                                                     {recipe.type && <span className="recipe-meta-item" title="Type"><i className="fas fa-utensil-spoon icon-prefix"></i>{recipe.type}</span>}
                                                     {recipe.cuisine && <span className="recipe-meta-item" title="Cuisine"><i className="fas fa-globe-americas icon-prefix"></i>{recipe.cuisine}</span>}
                                                     {recipe.chefName && <span className="recipe-meta-item" title="Chef"><i className="fas fa-user icon-prefix"></i>{recipe.chefName}</span>}
                                                 </div>
                                                 {recipe.description && <p className="recipe-description-preview">{recipe.description.substring(0, 100)}{recipe.description.length > 100 ? '...' : ''}</p>}
                                                 <div className="rating-section inline-rating">
                                                     <span>Rating:</span> {renderStars(averageRating)} {averageRating > 0 ? ` (${averageRating.toFixed(1)})` : ' (N/A)'}
                                                 </div>
                                                 <p className="recipe-view-count"><i className="fas fa-eye"></i><span>Views:</span> {recipe.viewCount ?? 0}</p>
                                                 <div className="recipe-actions">
                                                     <button onClick={() => handleViewRecipe(recipe.id)} className="button-view action-button"><i className="fas fa-eye"></i> Details</button>
                                                     {isMyRecipe && (
                                                         <>
                                                             <button onClick={() => handleEditRecipe(recipe)} className="button-edit action-button"><i className="fas fa-pencil-alt"></i> Edit</button>
                                                             <button onClick={() => handleDeleteRecipe(recipe.id)} className="button-delete action-button"><i className="fas fa-trash-alt"></i> Delete</button>
                                                         </>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     );
                 }
                case 'my-recipes':
                default: {
                    // ... (my-recipes rendering code remains the same, ensure button clears form) ...
                     if (isLoadingMyRecipes && myRecipes.length === 0) return <div className="loading-container"><p><i className="fas fa-spinner fa-spin"></i> Loading your recipes...</p></div>;
                     if (fetchMyRecipesError && myRecipes.length === 0) return <div className="error-container dashboard-section"><h2><i className="fas fa-book"></i> My Recipes</h2><p><strong>Error:</strong> {fetchMyRecipesError}</p></div>;
                     if (!fetchMyRecipesError && myRecipes.length === 0) {
                         return (
                             <div className="info-container dashboard-section empty-state">
                                 <h2><i className="fas fa-book"></i> My Recipes</h2>
                                 <p>You haven't added any recipes yet. Let's create your first masterpiece!</p>
                                 <button onClick={() => {
                                     resetRecipeForm(); // Clear form state
                                     handleNavClickUnified('add-recipe'); // Navigate to add section
                                 }}
                                     className="button primary-button"
                                 >
                                     <i className="fas fa-plus"></i> Add Your First Recipe
                                 </button>
                             </div>
                         );
                     }
                     return (
                         <div className="my-recipes-section dashboard-section">
                             <h2><i className="fas fa-book"></i> My Recipes ({myRecipes.length})</h2>
                             {fetchMyRecipesError && myRecipes.length > 0 && <p className="error-message info-subtle"><i className="fas fa-exclamation-triangle"></i> Note: Couldn't refresh recipe list automatically ({fetchMyRecipesError}). Displaying last known data.</p>}
                             <div className="recipe-list my-recipes-list">
                                 {myRecipes.map((recipe) => {
                                      const imageUrl = getFullImageUrl(recipe.imageUrl);
                                      const averageRating = recipe.averageRating ?? 0;
                                      return (
                                         <div key={`my-${recipe.id}`} className="recipe-card editable card">
                                             <div className="recipe-image-container">
                                                 {imageUrl ? (
                                                     <img src={imageUrl} alt={recipe.title || 'Recipe'} className="recipe-image"
                                                         onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement?.classList.add('image-error'); }}
                                                     />
                                                 ) : null }
                                                 <div className="recipe-image-placeholder">
                                                     <i className="fas fa-image"></i><span>{imageUrl ? 'Image Error' : 'No Image'}</span>
                                                 </div>
                                             </div>
                                             <div className="recipe-content-container">
                                                 <h4>{recipe.title || 'Untitled Recipe'}</h4>
                                                 <div className="recipe-meta">
                                                     {recipe.type && <span className="recipe-meta-item" title="Type"><i className="fas fa-utensil-spoon icon-prefix"></i>{recipe.type}</span>}
                                                     {recipe.cuisine && <span className="recipe-meta-item" title="Cuisine"><i className="fas fa-globe-americas icon-prefix"></i>{recipe.cuisine}</span>}
                                                 </div>
                                                 {recipe.description && <p className="recipe-description-preview">{recipe.description.substring(0, 80)}{recipe.description.length > 80 ? '...' : ''} </p>}
                                                 <div className="rating-section inline-rating">
                                                     <span>Rating:</span> {renderStars(averageRating)} {averageRating > 0 ? ` (${averageRating.toFixed(1)})` : ' (N/A)'}
                                                 </div>
                                                 <p className="recipe-view-count"><i className="fas fa-eye"></i><span>Views:</span> {recipe.viewCount ?? 0}</p>
                                                 <div className="recipe-actions">
                                                     <button onClick={() => handleViewRecipe(recipe.id)} className="button-view action-button"><i className="fas fa-eye"></i> View</button>
                                                     <button onClick={() => handleEditRecipe(recipe)} className="button-edit action-button"><i className="fas fa-pencil-alt"></i> Edit</button>
                                                     <button onClick={() => handleDeleteRecipe(recipe.id)} className="button-delete action-button"><i className="fas fa-trash-alt"></i> Delete</button>
                                                 </div>
                                             </div>
                                          </div>
                                      );
                                 })}
                             </div>
                         </div>
                     );
                }
            }
        } catch (error) {
            console.error("Error rendering content for section:", activeSection, error);
            return <div className="error-container"><p><strong>Unexpected Error:</strong> An error occurred while displaying the '{activeSection}' section. Please check the console for details or try refreshing the page.</p></div>;
        }
        // Moved renderRecipeForm call into the switch statement cases
    }, [
        activeSection, chefDetails, isLoadingChef, fetchChefError,
        isLoadingMyRecipes, fetchMyRecipesError, myRecipes,
        isLoadingAllRecipes, fetchAllRecipesError, allRecipes,
        profileFormData, recipeFormData, profileImageFile, // Keep state dependencies
        handleUpdateProfile, handleUploadProfileImage, handleAddOrUpdateRecipe,
        handleInputChange, handleEditRecipe, handleDeleteRecipe, handleViewRecipe,
        renderRecipeDetailView, handleNavClickUnified, handleCloseRecipeView,
        isLoadingRecipeDetail, fetchRecipeDetailError,
        renderRecipeForm, // Add the new form renderer function
        resetRecipeForm // Add the reset helper
    ]);


    // --- Main Component Render ---
    const getProfileImageUrlForNav = () => {
        return getFullImageUrl(chefDetails?.profilePictureUrl);
    };
    const profileImageUrlForNav = getProfileImageUrlForNav();
    const chefInitial = chefDetails?.name ? chefDetails.name.charAt(0).toUpperCase() : '?';

    return (
        <>
            <nav className="chef-dashboard-navbar">
                 <div className="navbar-brand">
                    <Link to="#" onClick={(e) => {e.preventDefault(); handleNavClickUnified('home'); }} aria-label="Go to dashboard home">
                        <i className="fas fa-hat-chef"></i> <span>RecipeNest Chef Panel</span>
                    </Link>
                </div>
                 <div className="navbar-links">
                     <button onClick={() => handleNavClickUnified('home')} className={`navbar-button ${activeSection === 'home' ? 'active' : ''}`}><i className="fas fa-tachometer-alt"></i> Home</button>
                     {/* My Recipes active for list, detail, and EDIT */}
                     <button onClick={() => handleNavClickUnified('my-recipes')} className={`navbar-button ${(activeSection === 'my-recipes' || activeSection === 'view-detail' || activeSection === 'edit-recipe') ? 'active' : ''}`}><i className="fas fa-book"></i> My Recipes</button>
                     {/* ADD RECIPE button *only* active for 'add-recipe', clears form */}
                     <button
                        onClick={() => {
                             console.log("DEBUG: Clicking Add Recipe navbar button.");
                             resetRecipeForm(); // Clear form state first
                             handleNavClickUnified('add-recipe'); // Then navigate
                         }}
                         className={`navbar-button ${activeSection === 'add-recipe' ? 'active' : ''}`} // Only active here
                     >
                         <i className="fas fa-plus-circle"></i> Add Recipe
                     </button>
                     <button onClick={() => handleNavClickUnified('view-all')} className={`navbar-button ${activeSection === 'view-all' ? 'active' : ''}`}><i className="fas fa-book-open"></i> All Recipes</button>
                     <button onClick={() => handleNavClickUnified('manage-profile')} className={`navbar-button ${activeSection === 'manage-profile' ? 'active' : ''}`}><i className="fas fa-user-cog"></i> Profile</button>
                 </div>
                 <div className="navbar-actions">
                     <div className="navbar-profile-section">
                         <div className="navbar-profile-avatar" onClick={() => handleNavClickUnified('manage-profile')} title={`Manage Profile (${chefDetails?.name || 'Chef'})`}>
                            {profileImageUrlForNav ? (
                                <img
                                    key={profileImageUrlForNav}
                                    src={profileImageUrlForNav}
                                    alt=""
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        const initialSpan = e.target.parentElement?.querySelector('.profile-initial');
                                        if (initialSpan) initialSpan.style.display = 'flex';
                                    }}
                                />
                             ) : null}
                            <span className="profile-initial" style={{ display: profileImageUrlForNav ? 'none' : 'flex' }}>
                                {chefInitial}
                            </span>
                         </div>
                         <span className="navbar-username" onClick={() => handleNavClickUnified('manage-profile')} title="Manage Profile">{chefDetails?.name || 'Chef'}</span>
                         <button onClick={handleLogout} className="navbar-button logout-button" title="Logout">
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="logout-text">Logout</span>
                         </button>
                     </div>
                 </div>
            </nav>
            <main className="chef-dashboard-content">
                {renderContent()}
            </main>
        </>
    );
};

export default ChefdashboardComponent;