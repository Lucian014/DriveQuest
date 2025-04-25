import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CsrfContext from "./pages/CsrfContext";
import { ThemeProvider } from "./components/ThemeContext";
import Navbar from "./components/Navbar";

// 👇 Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Payment = lazy(() => import('./pages/Payment'));

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
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/car_details/:id" element={<CarDetails />} />
                    <Route path="/payment" element={<Payment />} />
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
