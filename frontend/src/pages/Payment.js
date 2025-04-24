import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CsrfContext from "./CsrfContext";
import styles from '../styles/Payment.module.css';
import {motion, AnimatePresence} from "framer-motion";
import {useTheme} from "../components/ThemeContext";
import homeStyle from "../styles/Home.module.css";
function Payment() {
    const location = useLocation();
    const state = location.state;
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [price, setPrice] = useState(location.state.price);
    const [paymentMethod, setPaymentMethod] = useState('');
    const {darkMode} = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        if (!state)
            navigate('/home');
    }, [state, navigate]);

    const createRental = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        const rent_data = {
            start_date: state.startDate,
            end_date: state.endDate,
            days: state.days,
            price: price,
            payment_method: paymentMethod,
            points: Math.floor(0.05 * Math.pow(price, 1.2)),
        };

        const response = await fetch(`http://localhost:8000/drivequest/car_rental/${state.id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(rent_data),
        });

        if (response.ok) {
            const json = await response.json();
            console.log(json);
            alert("Rental created successfully");
            navigate('/home');
        } else {
            alert("Something went wrong");
        }
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
        <div className={styles.container_wrapper}>
        <div className={styles.container}>
            <p className={styles.details}>From: {state.startDate}</p>
            <p className={styles.details}>To: {state.endDate}</p>
            <p className={styles.details}>Days: {state.days}</p>
            {paymentMethod === "cash" ? (
                <p className={styles.details}>Price: {price + 10 * price / 100}</p>
            ) : (
                <p className={styles.details}>Price: {price}</p>
            )}
            <p className={styles.details}>Points: {Math.floor(0.05 * Math.pow(price, 1.2))}</p>
            <p className={styles.paymentMethodText}>Choose payment method:</p>
            <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.select}
            >
                <option value="">-- Select --</option>
                <option value="Credit Card">Credit/Debit Card</option>
                <option value="Paypal">PayPal</option>
                <option value="Cash">Cash on Pickup (10% more)</option>
            </select>

            <br /><br />
            <button
                onClick={createRental}
                disabled={!paymentMethod}
                className={styles.button}
            >
                Create Rental
            </button>
        </div>
        </div>
        </motion.div>
        </AnimatePresence>
    );
}

export default Payment;