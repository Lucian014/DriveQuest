import React, { useContext, useEffect, useState } from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from '../../styles/UserPages/Home.module.css';
import { useNavigate } from 'react-router-dom';
import CsrfContext from "../../components/CsrfContext";
import Footer from "../../components/Footer";

function Home() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [cars, setCars] = useState([]);
    const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Hybrid', 'Electric', 'Pickup', 'Luxury', 'Sport', 'Convertible'];
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [carType,setCarType] = useState(null);
    const [searchedCars, setSearchedCars] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const carsPerPage = 9;


    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);


    const totalPages = Math.ceil(cars.length / carsPerPage);
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

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
        type.toLowerCase()
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

    const handleSearch = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (searchInput) params.append('searchInput', searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase());
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (carType) params.append('carType', carType);

        await fetch(`http://localhost:8000/drivequest/search_cars/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then(data => {
                console.log(data);
                setSearchedCars(data);
                setSearchInput('');
                setCarType('');
            })
            .catch(err => console.log(err));
    }

    return (
        <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                variants={containerVariants}
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
                            Rent the perfect car in a few clicks
                        </motion.h1>
                        <motion.p
                            className={styles.hero_subtitle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Fast, simple, and at the best prices
                        </motion.p>

                        {/* SEARCH FORM */}
                        <motion.form
                            className={styles.search_form}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.input
                                type="text"
                                placeholder="Model"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className={styles.form_input}
                                whileFocus={{ scale: 1.02 }}
                            />
                            <motion.input
                                type="date"
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.form_input}
                                whileFocus={{ scale: 1.02 }}
                            />
                            <motion.input
                                type="date"
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.form_input}
                                whileFocus={{ scale: 1.02 }}
                            />

                            {/* INPUT WITH DROPDOWN FOR CAR TYPE */}
                            <motion.div
                                className={styles.dropdown_wrapper}
                                whileHover={{ scale: 1.01 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Car type (e.g., SUV)"
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
                                                whileHover={{ backgroundColor: '#00b8d9' }}
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
                                whileTap={{ scale: 0.97 }}
                                whileHover={{ backgroundColor: "#009ab8", scale: 1.02 }}
                                onClick={(e) => handleSearch(e)}
                            >
                                Find car
                            </motion.button>
                        </motion.form>
                    </motion.section>

                    {/* BENEFITS */}
                    <motion.section
                        className={styles.benefits}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={containerVariants}
                    >
                        <motion.h2 className={styles.section_title} variants={itemVariants}>
                            Why choose us?
                        </motion.h2>
                        <div className={styles.benefit_list}>
                            <motion.div
                                className={styles.benefit_item}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                            >
                                ✅ Affordable prices
                            </motion.div>
                            <motion.div
                                className={styles.benefit_item}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                            >
                                🚗 Diverse fleet
                            </motion.div>
                            <motion.div
                                className={styles.benefit_item}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                            >
                                📞 24/7 support
                            </motion.div>
                        </div>
                    </motion.section>


                    {/* SEARCHED CARS */}
                    {searchedCars ? (
                        <motion.section
                            className={styles.featured_cars}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            variants={containerVariants}
                        >
                            <motion.h2 className={styles.section_title} variants={itemVariants}>
                                Your Results
                            </motion.h2>
                            <div className={styles.car_list}>
                                {searchedCars.map((car) => (
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
                                        <p className={styles.car_price}>from {car.price}€/day</p>
                                        <motion.button
                                            className={styles.rent_button}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCar(car.id)}
                                        >
                                            Rent now
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    ) : null}


                    {/* RECOMMENDED CARS */}
                    <motion.section
                        className={styles.featured_cars}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={containerVariants}
                    >
                        <motion.h2 className={styles.section_title} variants={itemVariants}>
                            Recommended Cars
                        </motion.h2>

                        <div className={styles.car_list}>
                            {currentCars.map((car) => (
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
                                    <p className={styles.car_price}>from {car.price}€/day</p>
                                    <motion.button
                                        className={styles.rent_button}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCar(car.id)}
                                    >
                                        Rent now
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        <div className={styles.pagination_buttons}>
                            <button onClick={prevPage} disabled={currentPage === 1}>
                                Previous page
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages}>
                                Next page
                            </button>
                        </div>
                    </motion.section>
                </div>
                <Footer />
            </motion.div>
        </AnimatePresence>
    );
}

export default Home;