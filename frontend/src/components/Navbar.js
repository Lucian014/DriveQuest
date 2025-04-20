import react, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CsrfContext from "../pages/CsrfContext";
import SwitchButton from "./SwitchButton";
import styles from '../styles/Navbar.module.css';
import {Link} from "react-router-dom";

function Navbar() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        const tokenExpiration = localStorage.getItem('token-expiration');
        if (token && tokenExpiration) {
            const expirationTime = new Date(tokenExpiration);
            const currentTime = new Date();
            if (currentTime >= expirationTime) {
                localStorage.removeItem('auth-token');
                localStorage.removeItem('token-expiration');
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
            }
        }
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/drivequest/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });
            if (response.ok) {
                localStorage.removeItem('auth-token');
                localStorage.removeItem('token-expiration');
                setIsLoggedIn(false);
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const navItems = isLoggedIn ? ["Home", "Profile" , "Contact"]
        : ["Home", "Login"];

    const renderNav = (item, index) => {
        if (!item) return null;

        if (item === "Logout") {
            return (
                <div key={index} onClick={handleLogout} className={styles.navItem}>
                    {item}
                </div>
            );
        }

        let path = "/";
        if (item === "Home") path = "/home";
        if (item === "Login") path = "/";
        if (item === "Profile") path = "/profile";
        if (item === "Contact") path = "/contact";
        return (
            <Link to={path} key={index} className={styles.navItem}>
                {item}
            </Link>
        );
    };
    return (
        <nav className={styles.navbar}>
            <div className={styles.switchWrapper}>
                <SwitchButton/>
            </div>
            <div className={styles.logoWrapper}>
                <p className={styles.logo}>DriveQuest</p>
            </div>

            <div className={styles.navItems}>
                {navItems.map((item, index) => renderNav(item, index))}
            </div>
        </nav>
    );

}
export default Navbar;