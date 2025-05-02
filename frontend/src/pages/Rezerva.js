import styles from "../styles/UserPages/Profile.module.css";
import {motion} from "framer-motion";
import React from "react";

<div className={styles.car_list_wrapper}>
    <div className={styles.car_list}>
        {cars.length > 0 ? (
            cars.map((car, index) => (
                <div>
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
                </div>
            ))
        ) : (
            <p className={styles.no_rentals}>Nu ai închiriat nicio mașină momentan.</p>
        )}
    </div>
</div>