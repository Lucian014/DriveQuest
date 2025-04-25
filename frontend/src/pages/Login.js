// src/components/Login.js
import React, { useEffect, useState, useContext } from 'react';
import styles from '../styles/Login.module.css';
import homeStyle from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";
import CsrfContext from './CsrfContext';
import { useTheme } from "../components/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const csrftoken = useContext(CsrfContext);

    const images = [
        "../images/bestia.png",
        "../images/golf.png",
        "../images/logan.png",
    ];
    const length = images.length;

    // update theme attr on <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // carousel + fade logic
    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);              // start fade‐out
            setTimeout(() => {
                setCurrent(prev => (prev + 1) % length);
                setFade(true);             // fade‐in new image
            }, 1000);                    // match CSS opacity transition time
        }, 5000);
        return () => clearInterval(interval);
    }, [length]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!csrftoken) {
            alert('CSRF token is missing.');
            return;
        }
        const resp = await fetch('http://localhost:8000/drivequest/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (resp.ok) {
            const data = await resp.json();
            console.log(data);
            navigate('/home');
            const exp = new Date();
            exp.setHours(exp.getHours() + 6);
            localStorage.setItem('auth-token', 'true');
            localStorage.setItem('token-expiration', exp.toString());
        } else {
            const err = await resp.json();
            alert(err.message);
        }
    };

    return (
        <AnimatePresence mode="popLayout" exitBeforeEnter initial={false} animate="visible" exit="hidden">
            <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
            >
                <div className={styles.body}>
                    <div className={styles.left}>
                        <img
                            src={images[current]}
                            alt="carousel"
                            className={`${styles.imageCarrousel} ${fade ? styles.fade : ''}`}
                        />
                        <div className={styles.description}>
                            <h2 className={styles.h2}>New here?</h2>
                            <p className={styles.p}>
                                Click on the button below to go to the sign up page and create an account
                            </p>
                            <button className={styles.btn} onClick={() => navigate("/signup")}>
                                Sign up
                            </button>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.rightContainer}>
                            <h1 className={styles.login_title}>Login to your account</h1>
                            <form className={styles.login} onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    autoComplete="off"
                                    required
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    autoComplete="off"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <div className={styles.fixingColor}>
                                    <button className={styles.btn} type="submit">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Login;
