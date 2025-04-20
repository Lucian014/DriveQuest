import React, {useContext, useEffect, useState} from 'react';
import Navbar from "../components/Navbar";
import CsrfContext from "./CsrfContext";
import homeStyle from "../styles/Home.module.css";
import {useTheme} from "../components/ThemeContext";
import {AnimatePresence} from "framer-motion";
import {motion} from "framer-motion";
import styles from "../styles/Contact.module.css";

function Contact() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const {darkMode} = useTheme();
    const csrftoken = useContext(CsrfContext);

    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    },[darkMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            title: title,
            message: content,
            phone: phoneNumber,
        }
        fetch('http://localhost:8000/drivequest/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                alert(data.message);
            })
            .catch(error => {
                console.log(error);
            });
        setTitle('');
        setContent('');
        setPhoneNumber('');
    };

    return (
        <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
            <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
            >
                <h1 className={styles.form_title}>Contact Page</h1>
                <form onSubmit={handleSubmit} className={styles.form_container}>
                    <input
                        type="text"
                        placeholder="Title.."
                        value={title}
                        required
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input_field}
                    />
                    <input
                        type="text"
                        placeholder="Content.."
                        value={content}
                        required
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.input_field}
                    />
                    <input
                        type="text"
                        placeholder="Phone Number.."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={styles.input_field}
                    />
                    <button type="submit" className={styles.submit_button}>Confirm message</button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}

export default Contact;