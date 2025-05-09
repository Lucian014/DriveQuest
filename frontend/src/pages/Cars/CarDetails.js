// imports stay the same
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/Cars/CarDetails.module.css';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../components/ThemeContext";
import homeStyle from "../../styles/UserPages/Home.module.css";
import Loading from "../../components/Loading";
import Footer from "../../components/Footer";

function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [comments, setComments] = useState([]);
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
    const [relatedCars, setRelatedCars] = useState(null)
    const { darkMode } = useTheme();
    const [rating,setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/drivequest/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => data.user ? setUser(data.user) : setError('User not found.'))
            .catch(() => setError('A apărut o eroare la preluarea datelor.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/drivequest/car_details/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.car) {
                    console.log(data);
                    setCar(data.car);
                    setComments(data.comments || []);
                    setRelatedCars(data.related_cars);
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
            const differenceInDays = Math.ceil((end - start) / (1000 * 3600 * 24));
            setDays(differenceInDays);
            setPrice(differenceInDays * car.price);
        }
    };

    const createRent = (e) => {
        e.preventDefault();
        navigate('/payment', {
            state: { id, startDate, endDate, days, price },
        });
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
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
            alert('Something went wrong.');
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
            alert('Failed to delete comment.');
        }
    };

    const handleStarMouseEnter = (star) => {
        setHoverRating(star);
    };

    const handleStarMouseLeave = () => {
        setHoverRating(0);
    };

    const handleStarClick = async (e,star) => {
        setRating(star);
        await fetch(`http://localhost:8000/drivequest/rate_car/${id}/`, {
            method: 'POST',
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
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
    };

    if (loading) return <Loading />;
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
                            <div className={styles.infoContainer}>
                                <h2>{car.brand} {car.model}</h2>
                                <p><strong>Year:</strong> {car.year}</p>
                                <p><strong>Price per day:</strong> ${car.price}</p>
                                <p><strong>Car type:</strong> {car.car_type}</p>
                                <p><strong>Rental Center:</strong> {car.center}</p>
                                <p><strong>User Rating:</strong> {car.rating}</p>
                                {car.rented ? (
                                    <div className={styles.rentalStatus}>
                                        <p><strong>Status:</strong> Already rented</p>
                                        <p><strong>Available from:</strong> {formatDate(car.end_date)}</p>
                                    </div>
                                ) : (
                                    <form className={styles.form} onSubmit={getDetails}>
                                        <input
                                            type="date"
                                            value={startDate}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            value={endDate}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <button type="submit">Get Details</button>
                                    </form>
                                )}

                                {(days && price) && (
                                    <div className={styles.detailsSummary}>
                                        <p><strong>Days:</strong> {days}</p>
                                        <p><strong>Total Price:</strong> ${price}</p>
                                        <button onClick={createRent}>Rent Car</button>
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
