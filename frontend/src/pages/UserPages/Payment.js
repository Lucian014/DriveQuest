import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/UserPages/Payment.module.css';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../components/ThemeContext";
import homeStyle from "../../styles/UserPages/Home.module.css";
import Loading from "../../components/Loading";
import '../../App.css';

function Payment() {
    const location = useLocation();
    const state = location.state;
    const navigate = useNavigate();
    const csrftoken = useContext(CsrfContext);
    const [price] = useState(state.price);
    const [paymentMethod, setPaymentMethod] = useState('');
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [car, setCar] = useState(null);

    // New form state
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });
    const [paypalEmail, setPaypalEmail] = useState('');

    useEffect(() => {
        if (state) {
            fetch(`http://localhost:8000/drivequest/car_details/${state.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.car) setCar(data.car);
                    else setError('Mașina nu a fost găsită.');
                })
                .catch(() => setError('A apărut o eroare la preluarea datelor.'))
                .finally(() => setLoading(false));
        }
    }, [state, csrftoken]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        if (!state) navigate('/home');
    }, [state, navigate]);

    const createRental = async (e) => {
        e.preventDefault();
        // validate method-specific fields
        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }
        if (paymentMethod === 'Credit Card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)) {
            alert('Please fill in all card details.');
            return;
        }
        if (paymentMethod === 'Paypal' && !paypalEmail) {
            alert('Please enter your PayPal email.');
            return;
        }

        const rent_data = {
            start_date: state.startDate,
            end_date: state.endDate,
            days: state.days,
            price,
            payment_method: paymentMethod,
            points: Math.floor(0.05 * Math.pow(price, 1.2)),
            ...(paymentMethod === 'Credit Card' ? { card: cardDetails } : {}),
            ...(paymentMethod === 'Paypal' ? { paypal_email: paypalEmail } : {}),
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
            alert("Rental created successfully");
            navigate('/home');
        } else {
            alert("Something went wrong");
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear())}`;
    };

    if (loading) return <Loading />;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <AnimatePresence mode="popLayout" initial={false} exitBeforeEnter>
            <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
            >
                <div className={styles.container_wrapper}>
                    <form onSubmit={createRental} className={styles.container}>

                        {/* Left panel: payment methods & details */}
                        <div className={styles.methods}>
                            <p className={styles.paymentMethodText}>Choose payment method:</p>
                            <div className={styles.optionsContainer}>
                                {['Credit Card', 'Paypal', 'Cash'].map(method => (
                                    <div
                                        key={method}
                                        className={`${styles.optionItem} ${paymentMethod === method ? styles.optionItemSelected : ''}`}
                                        onClick={() => setPaymentMethod(method)}
                                    >
                                        {method === 'Cash' ? 'Cash on Pickup (10% more)' : method}
                                    </div>
                                ))}
                            </div>

                            {/* Conditional form fields */}
                            {paymentMethod === 'Credit Card' && (
                                <div className="flex flex-col gap-4 mt-4">
                                    <input
                                        type="text"
                                        placeholder="Card Number"
                                        value={cardDetails.number}
                                        onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                        className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Name on Card"
                                        value={cardDetails.name}
                                        onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                                        className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                                    />
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiry}
                                            onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                            className="w-full sm:w-1/2 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="CVV"
                                            value={cardDetails.cvv}
                                            onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                            className="w-full sm:w-1/2 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'Paypal' && (
                                <div className="flex flex-col gap-4 mt-4">
                                    <input
                                        type="email"
                                        placeholder="PayPal Email"
                                        value={paypalEmail}
                                        onChange={e => setPaypalEmail(e.target.value)}
                                        className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right panel: summary */}
                        <div className={styles.summary}>
                            <div className={styles.car}>
                                <h2 className="text-2xl mb-2 text-bold ">Summary:</h2>
                                <p>Car: {car.brand} {car.model}</p>
                                <img
                                    src={car.image ? `http://localhost:8000${car.image}` : '/images/defaultImage.webp'}
                                    alt={`${car.brand} ${car.model}`}
                                />
                            </div>
                            <div className="flex gap-4 justify-between">
                                <p className={styles.details}><strong>From:</strong> {formatDate(state.startDate)}</p>
                                <p className={styles.details}><strong>To:</strong> {formatDate(state.endDate)}</p>
                            </div>
                            <div className="flex gap-4 justify-between">
                                <p className={styles.details}><strong>Days:</strong> {state.days}</p>
                                <p className={styles.details}><strong>Price:</strong> {paymentMethod==='Cash' ? (price+price*0.1).toFixed(2):price.toFixed(2)} $</p>
                            </div>
                            <p className={styles.details}><strong>Points:</strong> {Math.floor(0.05 * Math.pow(price, 1.2))}</p>
                            <button
                                type="submit"
                                disabled={!paymentMethod}
                                className={styles.button}
                            >
                                Create Rental
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Payment;
