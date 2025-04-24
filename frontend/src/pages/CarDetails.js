import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import CsrfContext from "./CsrfContext";
import styles from '../styles/CarDetails.module.css';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/ThemeContext";
import homeStyle from "../styles/Home.module.css";

function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [days, setDays] = useState('');
    const [price, setPrice] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:8000/drivequest/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.user) {
                    setUser(data.user);
                    console.log(data.user);
                } else {
                    setError('User not found.');
                }
            })
            .catch(() => setError('A apărut o eroare la preluarea datelor.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:8000/drivequest/car_details/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.car) {
                    setCar(data.car);
                    setComments(data.comments);
                } else {
                    setError('Mașina nu a fost găsită.');
                }
            })
            .catch(() => setError('A apărut o eroare la preluarea datelor.'))
            .finally(() => setLoading(false));
    }, [id]);

    const getDetails = (e) => {
        e.preventDefault();
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const differenceInTime = end.getTime() - start.getTime();
            const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            setDays(differenceInDays);
            setPrice(differenceInDays * car.price);
        }
    };

    const createRent = (e) => {
        e.preventDefault();
        navigate('/payment', {
            state: {
                id,
                startDate,
                endDate,
                days,
                price,
            }
        });
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (newComment.trim().length <= 0) return;

        const response = await fetch(`http://localhost:8000/drivequest/post_comment/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify({ comment: newComment }),
        });

        if (response.ok) {
            const data = await response.json();
            setComments([...comments, data.comment]);
            setNewComment('');
        } else {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (commentID) => {
        const response = await fetch(`http://localhost:8000/drivequest/delete_comment/${commentID}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        });

        if (response.ok) {
            setComments(comments.filter(comment => comment.id !== commentID));
        } else {
            alert('Failed to delete comment. Please try again later.');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    if (loading) return <p>Se încarcă...</p>;
    if (error) return <p>{error}</p>;

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
            >
                <div className={styles.container}>
                    {car ? (
                        <div className={styles.carInfo}>
                            <p>Brand: {car.brand}</p>
                            <p>Model: {car.model}</p>
                            <p>Year: {car.year}</p>
                            <p>Price: {car.price}</p>
                            <img
                                className={styles.carImage}
                                src={car.image ? `http://localhost:8000${car.image}` : '/images/defaultImage.webp'}
                                alt={`${car.brand} ${car.model}`}
                            />
                            {car.rented ? (
                                <div className={styles.rentalStatus}>
                                    <p>Car is already rented</p>
                                    <p>Available from: {formatDate(car.end_date)}</p>
                                </div>
                            ) : (
                                <form className={styles.form} onSubmit={getDetails}>
                                    <input
                                        type="date"
                                        value={startDate}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setStartDate(e.currentTarget.value)}
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setEndDate(e.currentTarget.value)}
                                    />
                                    <button>Get Details</button>
                                </form>
                            )}
                            {(days && price) && (
                                <div className={styles.detailsSummary}>
                                    <p>Days: {days}</p>
                                    <p>Price: {price}</p>
                                    <button onClick={createRent}>Rent Car</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>Mașina nu a fost găsită.</p>
                    )}

                    <div className={styles.commentsSection}>
                        <form onSubmit={postComment} className={styles.commentForm}>
                            <textarea
                                placeholder="Write a comment..."
                                rows="4"
                                required
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className={styles.textarea}
                            ></textarea>
                            <button className={styles.postButton}>Post Comment</button>
                        </form>

                        {comments && comments.length > 0 ? (
                            <div className={styles.commentList}>
                                {comments.map((comment) => (
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
                                                {(user.username === comment.username || user.is_superuser) && (
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
                            <p className={styles.noComments}>No comments yet</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default CarDetails;
