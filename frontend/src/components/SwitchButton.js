import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/SwitchButton.module.css";

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => setDarkMode((prev) => !prev);

    return (
        <div className={styles.block}>
            <motion.button
                onClick={toggleTheme}
                className={`${styles.button} ${darkMode ? styles.dark : styles.light}`}
            >
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`${styles.toggleCircle} ${darkMode ? styles.darkCircle : styles.lightCircle}`}
                    style={{
                        left: darkMode ? "42px" : "4px"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={darkMode ? "moon" : "sun"}
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.3 }}
                            className={styles.sunMoon}
                        >
                            {darkMode ? "🌙" : "☀️"}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>
            </motion.button>
        </div>
    );
}
