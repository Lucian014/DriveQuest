import React, {useEffect, useState} from 'react';
import styles from "../../styles/Authentification/Login.module.css";
import {useNavigate} from "react-router-dom";
import { useContext } from 'react';
import CsrfContext from "../../components/CsrfContext";
import {motion} from "framer-motion";
import {AnimatePresence} from "framer-motion";
import styled from 'styled-components';


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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
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
                            <button className={styles.btn1} onClick={() => navigate("/")}>Login</button>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightContainer}>
                            <h1 className={styles.login_title}>Create a new account</h1>
                            <div className={styles.rightside}>
                                <form className={styles.login} onSubmit={handleSubmit}>
                                    <StyledWrapper>
                                        <div className="inputGroup">
                                        <div className={styles.names}>
                                                <div className="inputGroup">
                                                <input
                                                    type='text'
                                                    required
                                                    autoComplete="off"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                                <label htmlFor="name">First Name</label>
                                                </div>
                                                <div className="inputGroup">
                                                <input
                                                    type='text'
                                                    required
                                                    value={lastName}
                                                    autoComplete="off"
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                                <label className="label" htmlFor="name">Last Name</label>
                                                </div>
                                        </div>
                                        </div>
                                        <div className="inputGroup">
                                            <input type="text" required autoComplete="off" value={username}
                                                   onChange={e => setUsername(e.target.value)}/>
                                            <label htmlFor="name">Username</label>
                                        </div>
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


export default Signup;
