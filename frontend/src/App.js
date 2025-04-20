import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import CsrfContext from "./pages/CsrfContext";
import Contact from "./pages/Contact";
import CarDetails from "./pages/CarDetails";
import Navbar from "./components/Navbar";
import {ThemeProvider} from "./components/ThemeContext";
import homeStyle from "./styles/Home.module.css";


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
                <Navbar/>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path='/' element={<Login/>} />
                    <Route path='/signup' element={<SignUp/>} />
                    <Route path='/profile' element={<Profile/>} />
                    <Route path='/contact' element={<Contact/>} />
                    <Route path='/car_details/:id' element={<CarDetails/>} />
                </Routes>
            </Router>
        </CsrfContext.Provider>
        </ThemeProvider>
    );
}

export default App;