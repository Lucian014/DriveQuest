import React, { useContext, useEffect, useState } from 'react';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/Cars/RentalCenters.module.css';
import {useNavigate} from "react-router-dom";
import {motion,AnimatePresence} from "framer-motion";
import homeStyle from "../../styles/UserPages/Home.module.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from "../../components/Footer";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const coordinates = [47.1585, 27.6014];
const majorRomanianCities = [
    "Bucuresti",
    "Cluj-Napoca",
    "Timisoara",
    "Iasi",
    "Constanta",
    "Brasov",
    "Craiova",
    "Galati",
    "Ploiesti",
    "Oradea",
    "Braila",
    "Arad",
    "Pitesti",
    "Sibiu",
    "Targu Mures",
    "Baia Mare",
    "Buzau",
    "Botosani",
    "Satu Mare",
    "Ramnicu Valcea",
    "Suceava",
    "Drobeta-Turnu Severin",
    "Targoviste",
    "Focsani",
    "Bacau",
    "Resita",
    "Bistrita",
    "Tulcea",
    "Slatina",
    "Alba Iulia"
];



function RentalCenters() {
    const [centers, setCenters] = useState([]);
    const csrftoken = useContext(CsrfContext);
    const navigate = useNavigate();
    const [countryInput, setCountryInput] = useState('Romania');
    const [cityInput, setCityInput] = useState('Bucuresti');
    const [addressInput, setAddressInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [openingHoursData,setOpeningHoursData] = useState({});
    const [searchedCenters,setSearchedCenters] = useState([]);
    const [isSearched,setIsSearched] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const address =
        <svg xmlns="http://www.w3.org/2000/svg" style = {{width: '35px', height: '35px', color: '#4b5563',paddingBottom:'7px', marginRight:'5px'}} viewBox="5 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />

        </svg>
    const phone =
        <svg xmlns="http://www.w3.org/2000/svg" style = {{width: '24px', height: '24px', color: '#4b5563' ,marginRight:'13px'}} viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
        </svg>

    const search =
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:'24px',height:'24px' }}>
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        </svg>


    useEffect(() => {
        fetch('http://localhost:8000/drivequest/get_centers/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setCenters(data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);


    const openingHours = (id) => {
        fetch(`http://localhost:8000/drivequest/opening_hours/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        }).then(response => response.json())
            .then(data => {
                setOpeningHoursData(prev => ({ ...prev, [id]: data}));

            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        centers.forEach(center => {
            openingHours(center.id);
        });
    },[centers]);


    const handleCenter = (id) =>{
        navigate(`/center/${id}`)
    }

    const handleRentalCenterSearch = async(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (countryInput) {
            params.append('country', countryInput);
        }
        if (cityInput) {
            params.append('city', cityInput);
        }
        if (addressInput) {
            params.append('address', addressInput);
        }
        if (nameInput) {
            params.append('name', nameInput);
        }

        setIsSearched(true);
        await fetch(`http://localhost:8000/drivequest/search_centers/?${params.toString()}`, {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
        .then(data => {
                console.log(data);
            setSearchedCenters(data);
            setCountryInput('Romania');
            setCityInput('Bucuresti');
            setAddressInput('');
            setNameInput('');
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
            >
                <motion.form
                    className={styles.inputs}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    whileHover={{ scale: 1.01 }}
                    onSubmit={(e) => handleRentalCenterSearch(e)}
                >
                    <input
                        className={styles.CountryInput}
                        type="text"
                        placeholder="Country"
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                    />

                    <motion.div
                        className={homeStyle.dropdown_wrapper}
                        whileHover={{ scale: 1.01 }}
                    >
                        <input
                            type="text"
                            placeholder="Oraș"
                            value={cityInput}
                            onChange={(e) => {
                                setCityInput(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                            className={styles.CityInput}
                        />
                        {showDropdown && (
                            <motion.ul
                                className={homeStyle.dropdown_list}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: 'spring', damping: 25 }}
                            >
                                {majorRomanianCities.map((city) => (
                                    <motion.li
                                        key={city}
                                        onClick={() => {
                                            setCityInput(city);
                                            setShowDropdown(false);
                                        }}
                                        className={homeStyle.dropdown_item}
                                        whileHover={{ backgroundColor: '#00b8d9' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {city}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </motion.div>

                    <input
                        className={styles.AddressInput}
                        type="text"
                        placeholder="Address"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                    />
                    <input
                        className={styles.CenterNameInput}
                        type="text"
                        placeholder="Name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                    />
                    <button className={styles.searchButton}>Search{search}</button>
                </motion.form>

                <div className={styles.container}>
                    {searchedCenters.length === 0 && isSearched === true ?(

                        <p className={styles.noResultsMessage}>Nu s-a găsit nimic!</p>

                    ) : (
                        (searchedCenters.length > 0 ? searchedCenters : centers).map((center, id) => (
                            <div key={id} className={styles.card} onClick={() => handleCenter(center.id)}>
                                <div className={styles.content}>
                                    <div className={styles.text_content}>
                                        <p className={styles.name}>{center.name}</p>
                                        <p className={styles.info}>{address}{center.address}, {center.city}</p>
                                        <p className={styles.info}>{phone}{center.phone}</p>
                                        {openingHoursData[center.id] && (
                                            <div className={styles.opening_hours}>
                                                {Object.entries(openingHoursData[center.id]).map(([day, [start, end]]) => (
                                                    <p key={day}>
                                        <span className={styles.day}>
                                            {day.charAt(0).toUpperCase() + day.slice(1)}: {" "}
                                        </span>
                                                        <span className={styles.hours}>
                                            {start && end ? `${start} - ${end}` : "Inchis"}
                                        </span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                            <p className={styles.country}>{center.country}</p>
                                    </div>
                                    <div className={styles.MapWrapper} onClick={(e) => e.stopPropagation()}>
                                        <MapContainer center={[center.latitude, center.longitude]} zoom={12} style={{ height: '600px', width: '100%' }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <Marker position={[center.latitude, center.longitude]}>
                                                <Popup>{center.name}</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Footer />
            </motion.div>
        </AnimatePresence>
    );

}

export default RentalCenters;