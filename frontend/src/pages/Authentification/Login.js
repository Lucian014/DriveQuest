// src/components/Login.js
import React, { useEffect, useState, useContext } from 'react';
import styles from '../../styles/Authentification/Login.module.css';
import homeStyle from "../../styles/UserPages/Home.module.css";
import { useNavigate } from "react-router-dom";
import CsrfContext from '../../components/CsrfContext';
import { useTheme } from "../../components/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import styled from 'styled-components';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const csrftoken = useContext(CsrfContext);
    const [showPassword, setShowPassword] = useState(false);

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
                            <button className={styles.btn1} onClick={() => navigate("/signup")}>
                                Sign up
                            </button>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.rightContainer}>
                            <h1 className={styles.login_title}>Login to your account</h1>
                            <form className={styles.login} onSubmit={handleSubmit}>
                                <StyledWrapper>
                                    <div className="inputGroup">
                                        <input type="text" required autoComplete="off" value={email}
                                               onChange={e => setEmail(e.target.value)}/>
                                        <label htmlFor="name">Name</label>
                                    </div>
                                    <div className="inputGroup">
                                        <input type={showPassword ? "text" : "password"} required autoComplete="off" value={password}
                                               onChange={e => setPassword(e.target.value)}/>
                                        <label htmlFor="password">Password</label>
                                        <span className="eyeIcon" onClick={() => setShowPassword(!showPassword)}>
                                         <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                        </span>
                                    </div>
                                </StyledWrapper>
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

const StyledWrapper = styled.div`
    .eyeIcon {
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        cursor: pointer;
        color: #999;
        font-size: 1.2em;
    }

    .eyeIcon:hover {
        color: #333;
    }
    
  .inputGroup {
    font-family: 'Segoe UI', sans-serif;
    width:400px;
    position: relative;
      margin-top:15px;
  }

  .inputGroup input {
    font-size: 100%;
    padding: 0.8em;
    outline: none;
      padding-right: 3em;
    border: 2px solid rgb(200, 200, 200);
    background-color: transparent;
    border-radius: 20px;
    width: 100%;
  }

  .inputGroup label {
    font-size: 100%;
    position: absolute;
    left: 0;
    padding: 0.8em;
    margin-left: 0.5em;
    pointer-events: none;
    transition: all 0.3s ease;
    color: rgb(100, 100, 100);
  }

  .inputGroup :is(input:focus, input:valid)~label {
    transform: translateY(-50%) scale(.9);
    margin: 0em;
    margin-left: 1.3em;
    padding: 0.4em;
    background-color: #e8e8e8;
  }

  .inputGroup :is(input:focus, input:valid) {
    border-color: rgb(150, 150, 200);
  }`;


export default Login;
