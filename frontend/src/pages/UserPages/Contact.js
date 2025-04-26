import React, {useContext, useEffect, useState} from 'react';
import CsrfContext from "../../components/CsrfContext";
import homeStyle from "../../styles/UserPages/Home.module.css";
import {useTheme} from "../../components/ThemeContext";
import {AnimatePresence} from "framer-motion";
import {motion} from "framer-motion";
import styles from "../../styles/UserPages/Contact.module.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const coordinates = [47.1585, 27.6014];

function Contact() {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const {darkMode} = useTheme();
    const csrftoken = useContext(CsrfContext);
    const [rating,setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingMessage, setRatingMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    },[darkMode]);


    const handleStarClick = async (e,star) => {
        setRating(star);
        if(star <3){
            setRatingMessage("Thank you for your feedback. Please share your suggestions so we can make your experience even better.");
        } else{
            setRatingMessage("We're thrilled you love our app! Your satisfaction inspires us to keep getting better.");
        }
        await fetch('http://localhost:8000/drivequest/rate_website/', {
            method: 'PUT',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify({
                rating: star,
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
            }).catch(error => {
                console.log(error);
            })
        setShowModal(true);
    }

    const handleStarMouseEnter = (star) => {
        setHoverRating(star);
    };

    const handleStarMouseLeave = () => {
        setHoverRating(0);
    };

    const closeModal = () => {
        setShowModal(false);
    };

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
            })
        setTitle('');
        setContent('');
        setPhoneNumber('');
    };

    return (
        <div className={styles.contactContainer}>
            <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
                <motion.div
                    key={darkMode ? "dark" : "light"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    exit={{ opacity: 0 }}
                    className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
                >
                    <main>
                        <section className={styles.contactSection}>
                            <h2>We'd Love to Hear From You!</h2>
                            <p>If you have any questions, comments, or feedback, feel free to reach out to us using the form below.</p>

                            <div className={styles.contactContent}>
                                {/* Contact Form Section */}
                                <div className={styles.contactFormContainer}>
                                    <form id="contactForm" className={styles.contactForm} onSubmit={handleSubmit}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="name"><i className="fas fa-user"></i> Title</label>
                                            <input
                                                type="text"
                                                placeholder="Title.."
                                                value={title}
                                                required
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="email"><i className="fas fa-envelope"></i> Content</label>
                                            <input
                                                type="text"
                                                placeholder="Content.."
                                                value={content}
                                                required
                                                onChange={(e) => setContent(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="subject"><i className="fas fa-tag"></i> Phone number(optionally)</label>
                                            <input
                                                type="text"
                                                placeholder="Phone Number.."
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className={styles.submitBtn}>Send Message</button>
                                    </form>
                                </div>
                                <div className={styles.contactMap}>
                                    <h3>Our Location</h3>
                                    <MapContainer center={coordinates} zoom={12} style={{ height: "295px", width: "100%" }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={coordinates}>
                                            <Popup>
                                                Drivequest head center
                                            </Popup>
                                        </Marker>
                                    </MapContainer>

                                    {/* Rating Section */}
                                    <div className={styles.rateContainer}>
                                        <p>Rate Us</p>
                                        <div className={styles.stars}>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isFilled = star <= (hoverRating || rating);
                                                return (
                                                    <i
                                                        key={star}
                                                        className={`fas fa-star ${styles.star} ${isFilled ? styles.filled : ""}`}
                                                        onMouseEnter={() => handleStarMouseEnter(star)}
                                                        onMouseLeave={handleStarMouseLeave}
                                                        onClick={(e) => handleStarClick(e,star)}
                                                    ></i>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                    {showModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                                <p>{ratingMessage}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default Contact;