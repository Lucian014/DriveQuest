import React, { useState, useEffect, lazy, Suspense } from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation, Navigate} from 'react-router-dom';
import CsrfContext from "./components/CsrfContext";
import { ThemeProvider } from "./components/ThemeContext";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";
import loading from "./components/Loading";
import PleaseLogin from "./components/PleaseLogin";


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
const Prizes = lazy(() => import('./pages/UserPages/Prizes'));
const Admin = lazy(() => import('./pages/UserPages/Admin'));

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
    console.log(cookieValue);
    return cookieValue;
}

// 👇 Extracted inner App to access useLocation
function AppContent() {
    const location = useLocation();
    const hideNavbarRoutes = ['/', '/signup'];
    const [user, setUser] = useState(null);


    const [csrfToken, setCsrfToken] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/drivequest/csrf-token', {
            credentials: 'include',
        }).then(() => {
            const token = getCookie('csrftoken');
            setCsrfToken(token);
        });
    }, []);


    const ProtectedRoute = ({children}) => {
        return localStorage.getItem('auth-token') ? children : <Navigate to="/please-login" />;
    }

    const AdminRoute = ({ children }) => {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (localStorage.getItem('admin') === 'true') {
                fetch('http://localhost:8000/drivequest/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    credentials: 'include',
                })
                    .then(res => res.json())
                    .then(data => {
                        setUser(data.user);
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
            } else {
                setLoading(false); // no fetch, still must stop loading
            }
        }, []);

        if (loading) return <Loading />;

        return user?.is_superuser ? children : <Navigate to="/home" />;
    };

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
                    <Route path="/car_details/:id" element={<CarDetails />} />
                    <Route path="/rental_centers" element={<RentalCenters />} />
                    <Route path="/center/:id" element={<Center />} />
                    <Route path="loading" element={<Loading />} />
                    <Route path="/please-login" element={<PleaseLogin />} />
                    {}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                    <Route path="/payment" element={<ProtectedRoute>Payment /></ProtectedRoute>} />
                    <Route path="/prizes" element={<ProtectedRoute><Prizes /></ProtectedRoute>} />
                    {}
                    <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
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
