import styles from "../styles/Cars/RentalCenters.module.css";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import React from "react";

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