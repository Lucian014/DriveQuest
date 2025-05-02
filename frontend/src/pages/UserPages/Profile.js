import React, {useContext, useEffect, useState} from 'react';
import styles from '../../styles/UserPages/Profile.module.css';
import {motion , AnimatePresence} from "framer-motion";
import CsrfContext from "../../components/CsrfContext";
import homeStyles from '../../styles/UserPages/Home.module.css';
import {useTheme} from "../../components/ThemeContext";
import '../../App.css';

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
    const [instagram, setInstagram] = useState("");
    const [twitter, setTwitter] = useState("");
    const [tiktok, setTiktok] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [selectedTab, setSelectedTab] = useState("account");
    const [isOpen, setIsOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");
    const [currentPage, setCurrentPage] = useState(0); // Track the current page of cars
    const carsPerPage = 3; // Show 3 cars per page
    const [bills, setBills] = useState([]);

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
                setInstagram(data.user.instagram);
                setTwitter(data.user.twitter);
                setTiktok(data.user.tiktok);
                setLinkedin(data.user.tiktok);

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

        fetch(`http://localhost:8000/drivequest/bill_history/`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                setBills(data);
            }).catch(error => {console.log(error)});

    },[]);

    const handleSave = (e) => {
        e.preventDefault();

        const user_data = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            instagram: instagram,
            twitter: twitter,
            tiktok: tiktok,
            linkedin: linkedin,
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
                setInstagram(data.user.instagram);
                setTwitter(data.user.twitter);
                setTiktok(data.user.tiktok);
                setLinkedin(data.user.tiktok);
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

    const outsideNavigate = (url) => {
        if (url) {
            window.open(url, "_blank");
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear())}`;
    };


    const deleteRental = async (id) =>{
        const response = await fetch(`http://localhost:8000/drivequest/car_rental/${id}/`, {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            credentials: "include",
        });
        if (response.ok) {
            setCars(cars.filter(car => car.id !== id));
            setIsOpen(false);
            setIsEditing(false);
        } else{
            setModalTitle("Error");
            setModalContent("An error occurred while deleting the rental.");
        }
    }

    const handleNext = () => {
        if (currentPage < Math.floor(cars.length / carsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentCars = cars.slice(currentPage * carsPerPage, (currentPage + 1) * carsPerPage);

    return (
    <AnimatePresence mode={"popLayout"} exitBeforeEnter={true} initial={false} animate={"visible"} exit={"hidden"}>
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0 }}
        key={darkMode ? "dark" : "light"}
        className={darkMode ? homeStyles.body_dark : homeStyles.body_light}
    >
            <div className={styles.profile_container}>
                <div className={`${styles.left}`}>
                    <div className="relative">
                        <img
                            src={image ? image : '/images/defaultImage.png'}
                            alt="Profile Image"
                            className="rounded-full w-[100px] h-[100px] mb-4 object-cover"
                        />
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer shadow hover:bg-yellow-600">
                                <i className="fas fa-pen text-black"></i>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewImage(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    {isEditing && (
                        <div className={styles.image_actions}>
                            <div className={styles.imageButton} onClick={handleImageUpload}>
                                Upload Image
                            </div>
                            {image && (
                                <div className={styles.imageButton} onClick={handleImageDelete}>
                                    Delete Image
                                </div>
                            )}
                        </div>
                    )}
                    <h1 className="text-center text-2xl">{firstName} {lastName}</h1>
                    <h2 className="text-mb text-black/50">Current points: {points}</h2>

                    <div className="mt-6 w-full">
                        <div className="min-w-[260px] md:min-w-[300px]">
                            <div className="relative mb-3">
                                {isEditing ? (<input
                                    onChange={(e) => setInstagram(e.target.value)}
                                    type="text"
                                    placeholder="Enter Instagram URL"
                                    className="w-full p-2 pl-12 rounded-xl shadow-sm
                                     focus-within:ring-2 focus-within:ring-purple-500 focus:outline-none focus:border-transparent"
                                />) : (<button onClick={()=>{outsideNavigate(instagram)}} className="w-full text-mb p-2 pl-12 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-purple-500 flex items-center justify-start">
                                    Instagram
                                </button>)}
                                <i className="fab fa-instagram absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>

                            <div className="min-w-[260px] md:min-w-[300px]">
                                <div className="relative mb-3">
                                    {isEditing ? (<input
                                        onChange={(e) => setTwitter(e.target.value)}
                                        type="text"
                                        placeholder="Enter Twitter URL"
                                        className="w-full p-2 pl-12 rounded-xl shadow-sm
                                     focus-within:ring-2 focus-within:ring-purple-500 focus:outline-none focus:border-transparent"
                                    />) : (<button onClick={()=>{outsideNavigate(twitter)}} className="w-full text-mb p-2 pl-12 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-purple-500 flex items-center justify-start">
                                       Twitter
                                    </button>)}
                                    <i className="fab fa-twitter absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>

                        <div className="min-w-[260px] md:min-w-[300px]">
                                <div className="relative mb-3">
                                    {isEditing ? (<input
                                        onChange={(e) => setTiktok(e.target.value)}
                                        type="text"
                                        placeholder="Enter Tiktok URL"
                                        className="w-full p-2 pl-12 rounded-xl shadow-sm
                                     focus-within:ring-2 focus-within:ring-purple-500 focus:outline-none focus:border-transparent"
                                    />) : (<button onClick={()=>{outsideNavigate(tiktok)}} className="w-full text-mb p-2 pl-12 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-purple-500 flex items-center justify-start">
                                        Tiktok
                                    </button>)}
                                    <i className="fab fa-tiktok absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>

                        <div className="min-w-[260px] md:min-w-[300px]">
                                <div className="relative">
                                    {isEditing ? (<input
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        type="text"
                                        placeholder="Enter Linkedin URL"
                                        className="w-full p-2 pl-12 rounded-xl shadow-sm
                                     focus-within:ring-2 focus-within:ring-purple-500 focus:outline-none focus:border-transparent"
                                    />) : (<button onClick={()=>{outsideNavigate(linkedin)}} className="w-full text-mb p-2 pl-12 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-purple-500 flex items-center justify-start">
                                        Linkedin
                                    </button>)}
                                    <i className="fab fa-linkedin absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.tabs}>
                        {[
                            { key: "account", label: "Account info" },
                            { key: "rental", label: "Car rental history" },
                            { key: "payment", label: "Payment info" }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSelectedTab(key)}
                                className={`text-lg relative pl-4 pt-4 pb-1 transition-all duration-300 ease-in-out
          ${selectedTab === key ? "text-yellow-500" : "text-gray-400"}
          after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full
          after:transition-all after:duration-300 after:ease-in-out
          ${selectedTab === key ? "after:bg-yellow-500" : "after:bg-transparent"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                        {(selectedTab === "account") && (<div className={styles.info}>
                            <div className={styles.editable_field}>
                                <p className="text-lg font-medium text-black mb-1">First Name:</p>
                                <div className={styles.input_box}>
                                    {isEditing ? (
                                        <input
                                            className="focus:outline-none focus:border-transparent"
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
                                <p className="text-lg font-medium text-black mb-1">Last Name:</p>
                                <div className={styles.input_box}>
                                    {isEditing ? (
                                        <input
                                            className="focus:outline-none focus:border-transparent"
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
                                <p className="text-lg font-medium text-black mb-1">Username:</p>
                                <div className={styles.input_box}>
                                    {isEditing ? (
                                        <input
                                            className="focus:outline-none focus:border-transparent"
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
                                <p className="text-lg font-medium text-black mb-1">Email:</p>
                                <div className={styles.input_box}>
                                    <span>{email}</span>
                                </div>
                            </div>
                        </div>)}

                    {(selectedTab === "rental") && (<div className={styles.info}>
                        <div className={styles.car_list}>
                            {/* Left Arrow */}
                            <div className="flex justify-center items-center w-[40px]">
                                <button
                                    onClick={handlePrev}
                                    className={`px-2 py-2 rounded-lg ${currentPage === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-300'}`}
                                    disabled={currentPage === 0}
                                >
                                    ◀️
                                </button>
                            </div>

                            {/* Cars List */}
                            {currentCars.length > 0 ? (
                                currentCars.map((car, index) => (
                                    <div key={index} className={styles.listedCar}>
                                        <img
                                            className="w-[100%] h-[150px] object-cover rounded-lg"
                                            src={car.image ? `http://localhost:8000${car.image}` : '/images/defaultImage.webp'}
                                            alt={`${car.brand} ${car.model}`}
                                        />
                                        <h3 className="text-lg pl-1 font-medium text-black">
                                            {car.brand} {car.model} ({car.year})
                                        </h3>
                                        <p className="text-mb pl-1 text-black">
                                            📅 {formatDate(car.start_date)} – {formatDate(car.end_date)}
                                        </p>
                                        <p className="text-mb pl-1 text-black">
                                            ⏱️ {car.days} zile
                                        </p>
                                        <p className="text-mb pl-1 text-black">
                                            💶 Total: {car.price} €
                                        </p>
                                        {isEditing ? (
                                            <button
                                                onClick={() => {
                                                    setToDelete(car.id);
                                                    setIsOpen(!isOpen);
                                                    setModalTitle("Delete from Rental History");
                                                    setModalContent("Are you sure you want to delete this rental?");
                                                }}
                                                className="min-h-[30px] ml-1 text-mb bg-amber-400 rounded-lg w-auto"
                                            >
                                                Delete from Rental History
                                            </button>
                                        ) : (
                                            <div className="min-h-[30px]"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.no_rentals}>Nu ai închiriat nicio mașină momentan.</p>
                            )}

                            {/* Right Arrow */}
                            <div className="flex justify-center items-center w-[40px]">
                                <button
                                    onClick={handleNext}
                                    className={`px-2 py-2 rounded-lg ${currentPage >= Math.floor(cars.length / carsPerPage) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-300'}`}
                                    disabled={currentPage >= Math.floor(cars.length / carsPerPage)}
                                >
                                    ▶️
                                </button>
                            </div>
                        </div>
                    </div>)}

                    {(selectedTab === "payment") && (<div className={styles.info}>
                        {bills.length > 0 ? (
                            bills.map((bill, index) => (
                                <div key={bill.id} className="bill-card">
                                    <p><strong>Car :</strong> {bill.car_rental}</p>
                                    <p><strong>Total Amount:</strong> ${bill.total_amount}</p>
                                    <p><strong>Payment Method:</strong> {bill.payment_method}</p>
                                    <p><strong>From:</strong> {formatDate(bill.from_date)} <strong>Due:</strong> {formatDate(bill.due_date)}</p>
                                    {bill.pdf_url ? (
                                        <a href={bill.pdf_url} target="_blank" rel="noopener noreferrer">View PDF</a>
                                    ) : (
                                        <p>No PDF available</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No bills found.</p>
                        )}
                    </div>)}
                    <motion.div
                        className={styles.action_buttons}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {isEditing && (
                            <div className={styles.button} onClick={handleSave}>
                                Save Changes
                            </div>
                        )}
                        <div
                            className={styles.button}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </div>
                    </motion.div>
                </div>
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">{modalTitle}</h2>
                                <button onClick={()=>{setToDelete(null); setIsOpen(!isOpen)}} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <p className="text-gray-700">{modalContent}</p>
                            <div className="mt-6 flex justify-end gap-2">
                                <button onClick={()=>{setToDelete(null); setIsOpen(!isOpen)}} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                <button onClick={()=>{deleteRental(toDelete)}} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    </motion.div>
    </AnimatePresence>
    );
}

export default Profile;