// src/components/Login.js
import React, { useEffect, useState, useContext } from 'react';
import styles from '../../styles/Authentification/Login.module.css';
import { useNavigate } from "react-router-dom";
import CsrfContext from '../../components/CsrfContext';
import { AnimatePresence, motion } from "framer-motion";
import styled from 'styled-components';
import {scale} from "leaflet/src/control/Control.Scale";
import {FcGoogle} from 'react-icons/fc'
import {FaApple} from "react-icons/fa";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [showPassword, setShowPassword] = useState(false);

    const images = [
        "../images/bestia.png",
        "../images/golf.png",
        "../images/logan.png",
    ];
    const length = images.length;

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
            <div className={styles.authContainer}>
                <div className={styles.leftSide}>
                    <img src="/images/loginLogo.png" alt="DriveQuest" className={styles.heroImage} />
                    <p className={styles.caption}>Your Journey Starts Here</p>
                </div>

                <div className={styles.rightSide}>
                    <div className={styles.border}>
                        <h1 className={styles.title}>Log in to your account</h1>
                        <p className={styles.subtitle}>
                            Don’t have an account?{" "}
                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={() => navigate("/signup")}
                                className={styles.signupLink}
                            >
                                Sign up
                            </motion.span>
                        </p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <div className={styles.optionsRow}>
                                <div className={styles.remember}>
                                    <span>Remember me</span>
                                    <input type="checkbox" className={styles.checkbox} />
                                </div>
                                <span className={styles.forgot}>Forgot password?</span>
                            </div>
                            <button type="submit" className={styles.primaryBtn}>Login</button>

                            <div className={styles.divider}>or login with</div>

                            <div className={styles.providers}>
                                <button className={styles.providerBtn}><FcGoogle size={24} style={{verticalAlign: 'middle',marginBottom:'4px'}}/>Google</button>
                                <button className={styles.providerBtn}><FaApple size={28} style={{verticalAlign: 'middle',marginBottom:'6px'}}/>Apple</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
}

export default Login;