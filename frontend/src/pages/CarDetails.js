import React, {useContext, useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import CsrfContext from "./CsrfContext";

function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [days, setDays] = useState(null);
    const [price, setPrice] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null); // Resetează eroarea la fiecare fetch
        fetch(`http://localhost:8000/drivequest/car_details/${id}`, {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.car) {
                    console.log(data.car);
                    setCar(data.car);
                } else {
                    setError('Mașina nu a fost găsită.');
                }
            })
            .catch(err => {
                setError('A apărut o eroare la preluarea datelor.');
                console.log(err);
            })
            .finally(() => setLoading(false)); // Opresc încărcarea
    }, [id]);

    const getDetails = async (e)=>{
        e.preventDefault();
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const differenceInTime = end.getTime() - start.getTime();
            const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            setDays(differenceInDays);
            setPrice(differenceInDays*car.price);
        }
    }

    const createRent = async (e) => {
        e.preventDefault();
        const rent_data = {
            start_date: startDate,
            end_date: endDate,
            days: days,
            price: price,
        }

        const response = await fetch(`http://localhost:8000/drivequest/car_rental/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(rent_data),
        })

        if (response.ok) {
            const json = await response.json();
            console.log(json);
        }
        else{
            alert("Something went wrong");
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    if (loading) {
        return <p>Se încarcă...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {car ? (
                <div>
                    <p>Brand: {car.brand}</p>
                    <p>Model: {car.model}</p>
                    <p>Year: {car.year}</p>
                    <p>Price: {car.price}</p>
                    <img
                        src={car.image ? `http://localhost:8000${car.image}` : '/images/defaultImage.webp'}
                        alt={`${car.brand} ${car.model}`}
                    />
                    {car.rented ? (
                        <div>
                            <p>Car is already rented</p>
                            <p>Available from: {formatDate(car.end_date)}</p>
                        </div>
                    ) : (
                        <form onSubmit={getDetails}>
                            <input
                                type="date"
                                value={startDate}
                                required
                                min={new Date().toISOString().split('T')[0]} // sets today's date as minimum
                                onChange={(e) => setStartDate(e.currentTarget.value)}
                            />
                            <input
                                type="date"
                                value={endDate}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e)=>setEndDate(e.currentTarget.value)}
                            />
                            <button>Get Details</button>
                        </form>
                    )}
                    { (days && price) ? (
                        <div>
                            <p>Days: {days}</p>
                            <p>Price: {price}</p>
                            <button onClick={createRent}>Rent Car</button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <p>Mașina nu a fost găsită.</p>
            )}
        </div>
    );
}

export default CarDetails;