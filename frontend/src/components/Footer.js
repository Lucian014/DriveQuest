import React from 'react';
import styles from "../styles/Components/Footer.module.css";

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <span className={styles.logo}>🚗 DriveQuest</span>
            </div>

            <div className={styles.footerMiddle}>
                <div className={styles.about}>
                    <h4>About DriveQuest</h4>
                    <p>
                        DriveQuest helps you find the best car rentals and routes in Romania. Whether you're
                        exploring cities or taking a road trip, we make your journey smoother and smarter.
                    </p>
                </div>
                <div className={styles.contactInfo}>
                    <h4>Contact</h4>
                    <p>📍 Iași, Romania</p>
                    <p>📞 +40 123 456 789</p>
                    <p>✉️ <a href="mailto:support@drivequest.com">support@drivequest.com</a></p>
                    <div className={styles.socials}>
                        <a href="https://facebook.com"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://twitter.com"><i className="fab fa-twitter"></i></a>
                        <a href="https://instagram.com"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p className={styles.credits}>
                    Made with ❤️ by Mihnea‑Andrei Buzdugan & Lucian Covaliuc
                </p>
                <p className={styles.copy}>&copy; {new Date().getFullYear()} DriveQuest. All rights reserved.</p>
            </div>
        </footer>
    )
}


export default Footer;