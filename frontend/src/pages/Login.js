import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Login.module.css';
import {useNavigate} from "react-router-dom";
import { useContext } from 'react';
import CsrfContext from './CsrfContext';
import {useTheme} from "../components/ThemeContext";
import {AnimatePresence} from "framer-motion";
import homeStyle from "../styles/Home.module.css";
import {motion} from "framer-motion";
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const csrftoken = useContext(CsrfContext);

    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    },[darkMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!csrftoken) {
            alert('CSRF token is missing.');
            return;
        }
        const userData = {
            email: email,
            password: password,
        };
        const response = await fetch('http://localhost:8000/drivequest/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            navigate('/home');
            const expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + 6);
            localStorage.setItem('auth-token', 'true');
            localStorage.setItem('token-expiration', expirationTime.toString());
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    };

    return (
        <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
        <motion.div
            key={darkMode ? "dark" : "light"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
            className={darkMode ? homeStyle.body_dark : homeStyle.body_light}>
            <div className={styles.body}>
                <div className={styles.loginBox}>
                    <h1 className={styles.login_title}>Login to your account</h1>

                    <div className={styles.loginContent}>
                        <div className={styles.leftside}>
                            <form className={styles.login} onSubmit={handleSubmit}>
                                <input
                                    type='email'
                                    autoComplete="off"
                                    required
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    type='password'
                                    autoComplete="off"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="submit">Login</button>
                            </form>
                        </div>

                        <div className={styles.imagine}>
                            <img src={"../images/loginImage.png"} alt={"Imagine"} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
        </AnimatePresence>
    );
}

export default Login;