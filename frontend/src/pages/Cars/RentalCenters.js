import React, { useContext, useEffect, useState } from 'react';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/Cars/RentalCenters.module.css';
import {useNavigate} from "react-router-dom";

function RentalCenters() {
    const [centers, setCenters] = useState([]);
    const csrftoken = useContext(CsrfContext);
    const navigate = useNavigate();
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
        <div className={styles.container}>
            {centers.map((center, id) => (
                <div key={id} className={styles.card} onClick={() => handleCenter(center.id)}>
                    <p className={styles.name}>{center.name}</p>
                    <p className={styles.info}>{center.address}</p>
                    <p className={styles.info}>{center.city}</p>
                    <p className={styles.country}>{center.country}</p>
                </div>
            ))}
        </div>
    );
}

export default RentalCenters;
