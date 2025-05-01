import React, {useContext, useEffect, useState} from 'react';
import styles from '../../styles/UserPages/Profile.module.css';
import {motion , AnimatePresence} from "framer-motion";
import CsrfContext from "../../components/CsrfContext";
import homeStyles from '../../styles/UserPages/Home.module.css';
import {useTheme} from "../../components/ThemeContext";


function Profile() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [user, setUser] = useState({});
    const csrftoken = useContext(CsrfContext);
    const [cars, setCars] = useState([]);
    const [points, setPoints] = useState(0);
    const [XP, setXP] = useState(0);
    const {darkMode} = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
    }, [darkMode]);

    useEffect(() => {
        fetch("http://localhost:8000/drivequest/profile/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setUser(data.user);
                setEmail(data.user.email);
                setFirstName(data.user.firstName);
                setLastName(data.user.lastName);
                setUsername(data.user.username);
                setImage(data.user.profile_picture);
                setPoints(data.user.points);
                setXP(data.user.XP);
            })
            .catch(error => {
                console.log(error);
            });

        fetch(`http://localhost:8000/drivequest/car_rental/`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
        }).then(response => response.json())
            .then(data => {
                    console.log("Rented cars: ",data);
                    setCars(data);
            }).catch(error => {console.log(error)});
    },[]);

    const handleSave = (e) => {
        e.preventDefault();

        const user_data = {
            username: username,
            firstName: firstName,
            lastName: lastName,
        };

        fetch(`http://localhost:8000/drivequest/update_profile/${user.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
            body: JSON.stringify(user_data),
        })
            .then(response => response.json())
            .then(data => {
                setIsEditing(false);
                setUser(data.user);
                setFirstName(data.user.firstName);
                setLastName(data.user.lastName);
                setUsername(data.user.username);
                alert('Profile updated successfully!');
            })
            .catch(err => {
                console.log(err);
            });
    };

    const handleImageUpload = () => {
        if (!newImage) return;
        const formData = new FormData();
        formData.append("profile_picture", newImage);

        fetch(`http://localhost:8000/drivequest/update_profile/${user.id}/`, {
            method: "POST",
            headers:{
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                // Append a cache buster query parameter to force refresh
                if (data.user && data.user.profile_picture) {
                    // Prepend the backend URL and add a cache busting query
                    const updatedImageUrl = `http://localhost:8000/${data.user.profile_picture}?v=${Date.now()}`;
                    setImage(updatedImageUrl);
                }
                alert("Image uploaded successfully!");
                setNewImage(null);
            })
            .catch(err => console.log(err));
    };

    const handleImageDelete = () => {
        fetch(`http://localhost:8000/drivequest/update_profile/${user.id}/`, {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                setImage(null);
                alert("Image removed!");
            })
            .catch(err => console.log(err));
    };

    return (
    <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0 }}
        key={darkMode ? "dark" : "light"}
        className={darkMode ? homeStyles.body_dark : homeStyles.body_light}
    >
        <div className={styles.profile_box}>
            <div className={styles.profile_container}>
                <h1>{firstName}'s Profile</h1>
                <h2>{points}</h2>
                <motion.div
                    className={styles.profile_image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img
                        src={image ? image : '/images/defaultImage.png'}
                        alt="Profile Image"
                    />
                    {isEditing && (
                        <div className={styles.image_actions}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewImage(e.target.files[0])}
                            />
                            <div className={styles.action_buttons}>
                                <div className={styles.button} onClick={handleImageUpload}>
                                    Upload Image
                                </div>
                                {image && (
                                    <div className={styles.button} onClick={handleImageDelete}>
                                        Delete Image
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className={styles.editable_field}>
                    <p>Username:</p>
                    <div className={styles.input_box}>
                        {isEditing ? (
                            <input
                                type="text"
                                placeholder={username}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        ) : (
                            <span>{username}</span>
                        )}
                    </div>
                </div>

                <div className={styles.editable_field}>
                    <p>First Name:</p>
                    <div className={styles.input_box}>
                        {isEditing ? (
                            <input
                                type="text"
                                placeholder={firstName}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        ) : (
                            <span>{firstName}</span>
                        )}
                    </div>
                </div>

                <div className={styles.editable_field}>
                    <p>Last Name:</p>
                    <div className={styles.input_box}>
                        {isEditing ? (
                            <input
                                type="text"
                                placeholder={lastName}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        ) : (
                            <span>{lastName}</span>
                        )}
                    </div>
                </div>

                <div className={styles.editable_field}>
                    <p>Email:</p>
                    <div className={styles.input_box}>
                        <span>{email}</span>
                    </div>
                </div>

                <motion.div
                    className={styles.action_buttons}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div
                        className={styles.button}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </div>
                    {isEditing && (
                        <div className={styles.button} onClick={handleSave}>
                            Save Changes
                        </div>
                    )}
                </motion.div>
            </div>
            <div className={styles.car_list_wrapper}>
                <div className={styles.car_list}>
                    {cars.length > 0 ? (
                        cars.map((car, index) => (
                            <motion.div
                                key={index}
                                className={styles.car_card}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                            >
                                <img
                                    src={
                                        car.image
                                            ? `http://localhost:8000${car.image}`
                                            : '/images/defaultImage.webp'
                                    }
                                    alt={`${car.brand} ${car.model}`}
                                    className={styles.car_image}
                                />
                                <h3 className={styles.car_name}>
                                    {car.brand} {car.model}
                                </h3>
                                <p className={styles.car_info}>
                                    📅 {car.start_date} – {car.end_date}
                                </p>
                                <p className={styles.car_info}>
                                    ⏱️ {car.days} zile
                                </p>
                                <p className={styles.car_price}>
                                    💶 Total: {car.price} €
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <p className={styles.no_rentals}>Nu ai închiriat nicio mașină momentan.</p>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
    </AnimatePresence>
    );
}

export default Profile;