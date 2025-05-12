import React, {useEffect, useState} from 'react';
import styles from "../../styles/Authentification/SignUp.module.css";
import {useNavigate} from "react-router-dom";
import { useContext } from 'react';
import CsrfContext from "../../components/CsrfContext";
import {motion} from "framer-motion";
import {AnimatePresence} from "framer-motion";
import {FcGoogle} from "react-icons/fc";
import {FaApple} from "react-icons/fa";


function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [fade, setFade] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

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


    return (
        <AnimatePresence mode="popLayout" exitBeforeEnter initial={false} animate="visible" exit="hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
            >
                <div className={styles.authContainer}>
                    <div className={styles.leftSide}>
                        <img
                            src={"/images/loginLogo.png"}
                            alt="logo"
                            className={styles.heroImage}
                        />
                        <div className={styles.caption}>Your Journey Starts Here</div>
                    </div>

                    <div className={styles.rightSide}>
                        <div className={styles.border}>
                            <h1 className={styles.title}>Create a new account</h1>
                            <p className={styles.subtitle}>
                                Already have an account?
                                <span onClick={() => navigate("/")}>Login</span>
                            </p>

                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={`${styles.names}`}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="text"
                                            required
                                            autoComplete="off"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="text"
                                            required
                                            autoComplete="off"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        autoComplete="off"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="off"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                    />
                                    <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </span>
                                </div>

                                <button className={styles.primaryBtn} type="submit">Sign Up</button>

                                <div className={styles.divider}>or create an account with</div>

                                <div className={styles.providers}>
                                    <button className={styles.providerBtn}><FcGoogle size={24} style={{verticalAlign: 'middle',marginBottom:'4px'}}/>Google</button>
                                    <button className={styles.providerBtn}><FaApple size={28} style={{verticalAlign: 'middle',marginBottom:'6px'}}/>Apple</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );

}


export default Signup;
