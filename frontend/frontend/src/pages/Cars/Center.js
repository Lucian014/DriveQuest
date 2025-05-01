import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import CsrfContext from "../../components/CsrfContext";
import Loading from "../../components/Loading";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../styles/Cars/Center.module.css';
import {motion} from "framer-motion";  // 👈 import module

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Center() {
    const { id } = useParams();
    const [center, setCenter] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [cars, setCars] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8000/drivequest/center_details/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setCenter(data.center);
                setCars(data.center.cars);
            })
            .catch(console.error);
    }, [id, csrftoken]);

    if (!center) {
        return <div className={styles.loadingWrapper}><Loading /></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{center.name}</h1>
                <p>{center.address}</p>
                <p>{center.city}, {center.country}</p>
            </div>

            <div className={styles.cars}>
                {cars.length > 0 ? cars.map(car => (
                    <div key={car.id} className={styles.carCard} onClick={() => navigate(`/car_details/${car.id}/`)}>
                        <p className={styles.carBrand}>{car.brand}</p>
                        <p className={styles.carModel}>{car.model}</p>
                        <img
                            src={
                                car.image
                                    ? `http://localhost:8000${car.image}`
                                    : '/images/defaultImage.webp'
                            }
                            alt={`${car.brand} ${car.model}`}
                            className={styles.car_image}
                        />
                    </div>
                )) : <p>No cars available at this center.</p>}
            </div>

            <div className={styles.mapWrapper}>
                <MapContainer center={[center.latitude, center.longitude]} zoom={12} style={{ height: '100%', width: '100%' }}>
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
    );
}

export default Center;
