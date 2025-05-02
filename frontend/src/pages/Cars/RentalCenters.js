import React, { useContext, useEffect, useState } from 'react';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/Cars/RentalCenters.module.css';
import {useNavigate} from "react-router-dom";
import {useTheme} from "../../components/ThemeContext";
import {motion,AnimatePresence} from "framer-motion";
import homeStyle from "../../styles/UserPages/Home.module.css";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const coordinates = [47.1585, 27.6014];




function RentalCenters() {
    const [centers, setCenters] = useState([]);
    const csrftoken = useContext(CsrfContext);
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const [countryInput, setCountryInput] = useState('Romania');
    const [cityInput, setCityInput] = useState('Bucuresti');
    const [addressInput, setAddressInput] = useState('');
    const [nameInput, setNameInput] = useState('');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

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



    const handleCenter = (id) =>{
        navigate(`/center/${id}`)
    }
    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className={darkMode ? homeStyle.body_dark : homeStyle.body_light}
            >
                <div className={styles.inputs}>
                    <input className={styles.CountryInput} type="text" placeholder="Country" value={countryInput} onChange={(e) => setCountryInput(e.target.value)} />
                    <input className={styles.CityInput} type="text" placeholder="City" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
                    <input className={styles.AddressInput} type="text" placeholder="Address" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
                    <input className={styles.CenterNameInput} type="text" placeholder="Name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                    <button className={styles.searchButton}>Search🔎</button>
                </div>

                <div className={styles.container}>
                    {centers.map((center, id) => (
                        <div key={id} className={styles.card} onClick={() => handleCenter(center.id)}>
                            <div className={styles.content}>
                                <div className={styles.text_content}>
                                    <p className={styles.name}>{center.name}</p>
                                    <p className={styles.info}>{center.address}</p>
                                    <p className={styles.info}>{center.city}</p>
                                    <p className={styles.info}>{center.phone}</p>
                                    <p className={styles.country}>{center.country}</p>

                                </div>
                                <div className={styles.MapWrapper}>
                                    <MapContainer center={[center.latitude, center.longitude]} zoom={12} style={{ height: '400px', width: '100%' }}>
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
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );

}

export default RentalCenters;