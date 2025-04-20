import React, { useContext, useEffect, useState } from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from '../styles/Home.module.css';
import { useNavigate } from 'react-router-dom';
import CsrfContext from "./CsrfContext";
import {useTheme} from "../components/ThemeContext";

function Home() {
    const [carType, setCarType] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [cars, setCars] = useState([]);
    const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Hybrid', 'Electric', 'Pickup'];
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const {darkMode} = useTheme();

    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    },[darkMode]);


    useEffect(() => {
        fetch('http://localhost:8000/drivequest/cars', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                setCars(data);
                console.log(data);
            })
            .catch((err) => console.log(err));
    }, [csrftoken]);

    const handleCar = (id) => {
        navigate(`/car_details/${id}`);
    };

    const filteredTypes = carTypes.filter((type) =>
        type.toLowerCase().includes(carType.toLowerCase())
    );

    const handleSelect = (type) => {
        setCarType(type);
        setShowDropdown(false);
    };

    // Variante de animație
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
        <motion.div
            key={darkMode ? "dark" : "light"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
            variants={containerVariants}
            className={darkMode ? styles.body_dark : styles.body_light}
        >
            <div className={styles.hero}>
                {/* HERO SECTION */}
                <motion.section
                    className="hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h1
                        className={styles.hero_title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Închiriază mașina perfectă în câteva clickuri
                    </motion.h1>
                    <motion.p
                        className={styles.hero_subtitle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Rapid, simplu și la cele mai bune prețuri
                    </motion.p>

                    {/* FORMULAR CĂUTARE */}
                    <motion.form
                        className={styles.search_form}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <motion.input
                            type="text"
                            placeholder="Locație ridicare"
                            className={styles.form_input}
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.input
                            type="date"
                            className={styles.form_input}
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.input
                            type="date"
                            className={styles.form_input}
                            whileFocus={{ scale: 1.02 }}
                        />

                        {/* INPUT CU DROPDOWN PENTRU TIP MAȘINĂ */}
                        <motion.div
                            className={styles.dropdown_wrapper}
                            whileHover={{ scale: 1.01 }}
                        >
                            <input
                                type="text"
                                placeholder="Tip mașină (ex: SUV)"
                                value={carType}
                                onChange={(e) => {
                                    setCarType(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                                className={styles.form_input}
                            />
                            {showDropdown && filteredTypes.length > 0 && (
                                <motion.ul
                                    className={styles.dropdown_list}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ type: 'spring', damping: 25 }}
                                >
                                    {filteredTypes.map((type) => (
                                        <motion.li
                                            key={type}
                                            onClick={() => handleSelect(type)}
                                            className={styles.dropdown_item}
                                            whileHover={{ x: 5, backgroundColor: '#f1e6da' }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {type}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            )}
                        </motion.div>

                        <motion.button
                            type="submit"
                            className={styles.form_input}
                            whileHover={{ scale: 1.03, backgroundColor: '#9c7355' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Caută mașină
                        </motion.button>
                    </motion.form>
                </motion.section>

                {/* AVANTAJE */}
                <motion.section
                    className={styles.benefits}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={containerVariants}
                >
                    <motion.h2 className={styles.section_title} variants={itemVariants}>
                        De ce să ne alegi?
                    </motion.h2>
                    <div className={styles.benefit_list}>
                        <motion.div
                            className={styles.benefit_item}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                        >
                            ✅ Prețuri accesibile
                        </motion.div>
                        <motion.div
                            className={styles.benefit_item}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                        >
                            🚗 Flotă diversificată
                        </motion.div>
                        <motion.div
                            className={styles.benefit_item}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                        >
                            📞 Asistență 24/7
                        </motion.div>
                    </div>
                </motion.section>

                {/* MAȘINI RECOMANDATE */}
                <motion.section
                    className={styles.featured_cars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={containerVariants}
                >
                    <motion.h2 className={styles.section_title} variants={itemVariants}>
                        Mașini recomandate
                    </motion.h2>
                    <div className={styles.car_list}>
                        {cars.map((car) => (
                            <motion.div
                                key={car.id}
                                className={styles.car_card}
                                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                            >
                                <motion.img
                                    src={
                                        car.image
                                            ? `http://localhost:8000${car.image}`
                                            : '/images/defaultImage.webp'
                                    }
                                    alt={`${car.brand} ${car.model}`}
                                    className={styles.car_image}
                                    whileHover={{ scale: 1.03 }}
                                />
                                <h3 className={styles.car_name}>
                                    {car.brand} {car.model} {car.year}
                                </h3>
                                <p className={styles.car_price}>de la {car.price}€/zi</p>
                                <motion.button
                                    className={styles.rent_button}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCar(car.id)}
                                >
                                    Închiriază
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </motion.div>
        </AnimatePresence>
    );
}

export default Home;
