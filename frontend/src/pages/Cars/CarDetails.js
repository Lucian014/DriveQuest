// src/pages/Cars/CarDetails.js

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import CsrfContext from "../../components/CsrfContext";
import DatePicker from 'react-datepicker';
import { isWithinInterval, parseISO, format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../../styles/Cars/CarDetails.module.css';
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../../components/Loading";
import Footer from "../../components/Footer";

function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [days, setDays] = useState('');
    const [price, setPrice] = useState(null);
    const [rentalHistory, setRentalHistory] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [relatedCars, setRelatedCars] = useState([]);
    const [rating, setRating] = useState(0);

    // load current user
    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/drivequest/user`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setUser(data.user))
            .catch(() => setError('Error loading user'))
            .finally(() => setLoading(false));
    }, [csrftoken]);

    // load car details, comments, related cars, rental history
    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/drivequest/car_details/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setCar(data.car);
                setComments(data.comments || []);
                setRelatedCars(data.related_cars || []);
                const intervals = (data.rental_history || []).map(r => ({
                    start: parseISO(r.start_date),
                    end: parseISO(r.end_date),
                    rawEnd: r.end_date
                }));
                setRentalHistory(intervals);
            })
            .catch(() => setError('Error loading car'))
            .finally(() => setLoading(false));
    }, [id, csrftoken]);

    // disable dates within any rental interval
    const isDayDisabled = date =>
        rentalHistory.some(({ start, end }) =>
            isWithinInterval(date, { start, end })
        );

    // render day cell with tooltip and dimming
    const renderDay = (day, date) => {
        const disabled = isDayDisabled(date);
        const interval = rentalHistory.find(({ start, end }) =>
            isWithinInterval(date, { start, end })
        );
        const title = disabled
            ? `Rented until ${format(parseISO(interval.rawEnd), 'dd-MM-yyyy')}`
            : undefined;
        return (
            <div title={title}>
                <span style={{ opacity: disabled ? 0.4 : 1 }}>{day}</span>
            </div>
        );
    };

    // compute days & price
    const getDetails = e => {
        e.preventDefault();
        if (startDate && endDate) {
            const diff = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));
            setDays(diff);
            setPrice(diff * car.price);
        }
    };

    // navigate to payment
    const createRent = e => {
        e.preventDefault();
        navigate('/payment', { state: { id, startDate, endDate, days, price } });
    };

    // post a new comment
    const postComment = async e => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const res = await fetch(
            `http://localhost:8000/drivequest/post_comment/${id}/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                body: JSON.stringify({ comment: newComment })
            }
        );
        if (res.ok) {
            const d = await res.json();
            setComments([...comments, d.comment]);
            setNewComment('');
        } else {
            alert('Error posting comment');
        }
    };

    // delete a comment
    const handleDelete = async cid => {
        const res = await fetch(
            `http://localhost:8000/drivequest/delete_comment/${cid}/`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include'
            }
        );
        if (res.ok) setComments(comments.filter(c => c.id !== cid));
        else alert('Failed to delete comment');
    };

    // rate the car
    const handleStarClick = async (e, star) => {
        setRating(star);
        await fetch(`http://localhost:8000/drivequest/rate_car/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ rating: star })
        });
    };

    const formatDate = ds => {
        const d = new Date(ds);
        return `${String(d.getDate()).padStart(2, '0')}-${String(
            d.getMonth() + 1
        ).padStart(2, '0')}-${String(d.getFullYear()).slice(-2)}`;
    };

    if (loading) return <Loading />;
    if (error) return <p>{error}</p>;

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
            >
                <div className={styles.container}>
                    {car && (
                        <div className={styles.topSection}>
                            <div className={styles.imageContainer}>
                                <img
                                    className={styles.carImage}
                                    src={car.image ? `http://localhost:8000${car.image}` : '/images/defaultImage.webp'}
                                    alt={`${car.brand} ${car.model}`}
                                />
                                <div className={styles.rateContainerCar}>
                                    <p>Rate Vehicle</p>
                                    <div className={styles.stars}>
                                        {[1, 2, 3, 4, 5].map(star => {
                                            const filled = star <= rating;
                                            return (
                                                <i
                                                    key={star}
                                                    className={`fas fa-star ${styles.star} ${filled ? styles.filled : ''}`}
                                                    onClick={e => handleStarClick(e, star)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.infoContainer}>
                                <h2>{car.brand} {car.model}</h2>
                                <p><strong>Year:</strong> {car.year}</p>
                                <p><strong>Price/day:</strong> ${car.price}</p>
                                <p><strong>Type:</strong> {car.car_type}</p>
                                <p><strong>Center:</strong> {car.center}</p>
                                <p><strong>Rating:</strong> {car.rating}</p>

                                <form className={styles.form} onSubmit={getDetails}>
                                    {[{
                                        date: startDate,
                                        onChange: setStartDate,
                                        selects: 'Start',
                                        placeholder: 'Start date'
                                    }, {
                                        date: endDate,
                                        onChange: setEndDate,
                                        selects: 'End',
                                        placeholder: 'End date'
                                    }].map(({ date, onChange, selects, placeholder }) => (
                                        <div key={selects} className={styles.datePickerWrapper}>
                                            <DatePicker
                                                selected={date}
                                                onChange={onChange}
                                                selectsStart={selects === 'Start'}
                                                selectsEnd={selects === 'End'}
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={selects === 'Start' ? new Date() : startDate || new Date()}
                                                excludeDateIntervals={rentalHistory}
                                                placeholderText={placeholder}
                                                calendarClassName={styles.customCalendar}
                                                dayClassName={date => {
                                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                                    const isExcluded =
                                                        rentalHistory.some(({ start, end }) => {
                                                            const startDate = new Date(start);
                                                            const endDate = new Date(end);
                                                            return date >= startDate && date <= endDate;
                                                        });

                                                    if (isExcluded) return styles.excludedDate;
                                                    if (isWeekend) return styles.weekend;
                                                    return undefined;
                                                }}
                                                renderCustomHeader={({
                                                                         date,
                                                                         changeYear,
                                                                         changeMonth,
                                                                         decreaseMonth,
                                                                         increaseMonth,
                                                                         prevMonthButtonDisabled,
                                                                         nextMonthButtonDisabled
                                                                     }) => (
                                                    <div className={styles.customHeader}>
                                                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button" className={styles.navButton}>
                                                            {'‹'}
                                                        </button>

                                                        <select
                                                            value={date.getFullYear()}
                                                            onChange={e => changeYear(Number(e.target.value))}
                                                        >
                                                            {Array.from({ length: 15 }, (_, i) => {
                                                                const y = new Date().getFullYear() - 7 + i;
                                                                return <option key={y} value={y}>{y}</option>;
                                                            })}
                                                        </select>

                                                        <select
                                                            value={date.getMonth()}
                                                            onChange={e => changeMonth(Number(e.target.value))}
                                                        >
                                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                                                .map((m, i) => <option key={m} value={i}>{m}</option>)}
                                                        </select>

                                                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type="button" className={styles.navButton}>
                                                            {'›'}
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    ))}
                                    <button type="submit">Get Details</button>
                                </form>



                                {days && price && (
                                    <div className={styles.detailsSummary}>
                                        <p><strong>Days:</strong> {days}</p>
                                        <p><strong>Total:</strong> ${price}</p>
                                        <button onClick={createRent}>Rent</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.bottomSection}>
                        {relatedCars && relatedCars.length > 0 ? (
                            <div className={styles.relatedSection}>
                                <h4>Similar Cars You Might Like</h4>
                                <div className={styles.relatedList}>
                                    {relatedCars.map(r => (
                                        <div key={`${r.id}-${Math.random()}`} className={styles.relatedCard} onClick={() => navigate(`/car_details/${r.id}`)}>
                                            <img src={r.image ? `http://localhost:8000${r.image}` : '/images/defaultImage.webp'} alt={r.model}/>
                                            <div className={styles.relatedDetails}>
                                                <p>{r.brand} {r.model}</p>
                                                <p>Fabrication year: {r.year}</p>
                                                <p>Available at: {r.center}</p>
                                                <p>Price: ${r.price}/day</p>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        ) : null}
                        <div className={styles.commentsSection}>
                            <h3>Comments & Feedback</h3>  {/* updated title */}
                            <p className={styles.sectionSubtitle}>We value your feedback! Share your thoughts below.</p>  {/* new subtitle */}
                            <form onSubmit={postComment} className={styles.commentForm}>
                            <textarea
                                placeholder="Write a comment..."
                                rows="4"
                                required
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className={styles.textarea}
                            ></textarea>
                                <button type="submit" className={styles.postButton}>Post Comment</button>
                            </form>

                            {comments.length > 0 ? (
                                <div className={styles.commentList}>
                                    {comments.map(comment => (
                                        <div key={comment.id} className={styles.comment}>
                                            <img
                                                src={user && user.profile_picture ? `http://localhost:8000${user.profile_picture}` : '/images/defaultImage.webp'}
                                                alt="Avatar"
                                                className={styles.avatar}
                                            />
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <div>
                                                        <span className={styles.username}>{comment.username}</span>
                                                        <span className={styles.commentDate}>{formatDate(comment.date)}</span>
                                                    </div>
                                                    {(user.username && (user.username === comment.username || user.is_superuser)) && (
                                                        <button
                                                            className={styles.deleteButton}
                                                            onClick={() => handleDelete(comment.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={styles.commentText}>
                                                    <p>{comment.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noCommentsWrapper}>
                                    <p className={styles.noComments}>No comments yet</p>
                                    <p className={styles.encourage}>Be the first to share your thoughts! 😊</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </motion.div>
        </AnimatePresence>
    );
}

export default CarDetails;
