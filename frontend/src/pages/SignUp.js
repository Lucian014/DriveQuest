import React, {useEffect, useState} from 'react';
import styles from "../styles/Login.module.css";
import {useNavigate} from "react-router-dom";
import { useContext } from 'react';
import CsrfContext from "./CsrfContext";
import {useTheme} from "../components/ThemeContext";
import {motion} from "framer-motion";
import homeStyle from "../styles/Home.module.css";
import {AnimatePresence} from "framer-motion";

function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const {darkMode} = useTheme();
    const [fade, setFade] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!csrftoken) {
            alert('CSRF token is missing.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters.');
            return;
        }

        const userData = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            username: username,
        };

        const response = await fetch('http://localhost:8000/drivequest/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(userData),
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



    const images = [
        "../images/bestia.png",
        "../images/golf.png",
        "../images/logan.png",
    ];

    const [current, setCurrent] = useState(0);
    const length = images.length;

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

    return (
        <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
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
                            <h2 className={styles.h2}>Already have an account?</h2>
                            <p className={styles.p}>Click the button below to return to the login page.</p>
                            <button className={styles.btn} onClick={() => navigate("/")}>Login</button>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightContainer}>
                            <h1 className={styles.login_title}>Create a new account</h1>
                            <div className={styles.rightside}>
                                <form className={styles.login} onSubmit={handleSubmit}>
                                    <div className={styles.names}>
                                        <input
                                            type='text'
                                            required
                                            placeholder='First name'
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                        <input
                                            type='text'
                                            required
                                            placeholder='Last name'
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
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
                                    <input
                                        type='password'
                                        autoComplete="off"
                                        required
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button className={styles.btn} type="submit">Sign Up</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Signup;
