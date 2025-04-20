import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Login.module.css';
import {useNavigate} from "react-router-dom";
import { useContext } from 'react';
import CsrfContext from './CsrfContext';



function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const csrftoken = useContext(CsrfContext);


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
        <div className={styles.body}>
            <div className={styles.loginContainer}>
                <div className={styles.leftside}>
                    <div className={styles.welcome}>
                        <p>Login to your account</p>
                    </div>
                    {/* Wrap inputs in a form so browser validations are automatically handled */}
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
    );
}

export default Login;