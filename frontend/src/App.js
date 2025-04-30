import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CsrfContext from "./components/CsrfContext";
import { ThemeProvider } from "./components/ThemeContext";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";

// 👇 Lazy-loaded pages
const Home = lazy(() => import('./pages/UserPages/Home'));
const Login = lazy(() => import('./pages/Authentification/Login'));
const SignUp = lazy(() => import('./pages/Authentification/SignUp'));
const Profile = lazy(() => import('./pages/UserPages/Profile'));
const Contact = lazy(() => import('./pages/UserPages/Contact'));
const CarDetails = lazy(() => import('./pages/Cars/CarDetails'));
const Payment = lazy(() => import('./pages/UserPages/Payment'));
const RentalCenters = lazy(()=>import('./pages/Cars/RentalCenters'));
const Center = lazy(() => import('./pages/Cars/Center'));


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 👇 Extracted inner App to access useLocation
function AppContent() {
    const location = useLocation();
    const hideNavbarRoutes = ['/', '/signup'];

    // Scroll to top whenever route changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/car_details/:id" element={<CarDetails />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/rental_centers" element={<RentalCenters />} />
                    <Route path="/center/:id" element={<Center />} />
                </Routes>
            </Suspense>
        </>
    );
}

function App() {
    const [csrfToken, setCsrfToken] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/drivequest/csrf-token', {
            credentials: 'include',
        }).then(() => {
            const token = getCookie('csrftoken');
            setCsrfToken(token);
        });
    }, []);

    return (
        <ThemeProvider>
            <CsrfContext.Provider value={csrfToken}>
                <Router>
                    <AppContent />
                </Router>
            </CsrfContext.Provider>
        </ThemeProvider>
    );
}

export default App;
