import {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CsrfContext from "./CsrfContext";
import SwitchButton from "./SwitchButton";
import styles from '../styles/Components/Navbar.module.css';
import {Link} from "react-router-dom";
import { FaHome,FaAngleRight, FaSignInAlt, FaUser, FaPhone, FaMapMarkerAlt, FaGift, FaSignOutAlt } from 'react-icons/fa';
import {motion,AnimatePresence} from "framer-motion";

function Navbar() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [menuOpen,setMenuOpen ] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1140);
    const navIcons = {
        "Home": <FaHome />,
        "Login": <FaSignInAlt />,
        "Profile": <FaUser />,
        "Contact": <FaPhone />,
        "Pick-up Points": <FaMapMarkerAlt />,
        "Prizes": <FaGift />,
        "Logout": <FaSignOutAlt />
    };

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

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1140);
            if (window.innerWidth >= 1140) {
                setMenuOpen(false); // Închidem meniul automat pe ecranele mari
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    const navItems = isLoggedIn ? ["Home", "Pick-up Points", "Profile" , "Prizes", "Contact", "Logout"]
        : ["Home", "Login", "Pick-up Points"];

    const menuVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            height: "auto",
            paddingTop: "2rem",
            paddingBottom: "2rem",
            transition: {
                duration: 0.4,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.07
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };


    const renderNav = (item, index) => {
        if (!item) return null;

        const icon = navIcons[item];
        const iconWrapper = menuOpen ? (
            <span className={styles.iconCircle}>
            {icon}
        </span>
        ) : null;

        if (item === "Logout") {
            return (
                <div key={index} onClick={handleLogout} className={styles.navItem}>
                    {iconWrapper}
                    <span>{item}</span>
                    <span className={styles.navArrow}>{menuOpen ? <FaAngleRight/> : null}</span>
                </div>
            );
        }

        let path = "/";
        if (item === "Home") path = "/home";
        if (item === "Login") path = "/";
        if (item === "Profile") path = "/profile";
        if (item === "Contact") path = "/contact";
        if (item === "Pick-up Points") path = "/rental_centers"
        if (item === "Prizes") path = "/prizes";

        return (
            <Link to={path} key={index} className={styles.navItem}>
                {iconWrapper}
                <span>{item}</span>
                <span className={styles.navArrow}>{menuOpen ? <FaAngleRight/> : null}</span>
            </Link>
        );
    };


    return (
        <nav className={styles.navbar}>
            <div className={styles.switchWrapper}>
                <SwitchButton />
            </div>

            <div className={styles.logoWrapper}>
                <p className={styles.logo}>DriveQuest</p>
            </div>

            <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
            </div>

            <AnimatePresence>
                {menuOpen && !isLargeScreen && ( // Doar activezi animațiile pe ecranele mici
                    <motion.div
                        className={`${styles.navItems} ${menuOpen ? styles.open : ''}`}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={menuVariants}
                    >
                        {navItems.map((item, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                {renderNav(item, index)}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                {isLargeScreen && (
                    <div className={styles.navItems}>
                        {navItems.map((item, index) => renderNav(item, index))}
                    </div>
                )}
            </AnimatePresence>
        </nav>
    );

}
export default Navbar;