import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import CsrfContext from "../../components/CsrfContext";
import Loading from "../../components/Loading";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../styles/Cars/Center.module.css';
import {motion} from "framer-motion";  // 👈 import module
import '../../App.css';
import Footer from "../../components/Footer";


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
    const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Hybrid', 'Electric', 'Pickup', 'Luxury', 'Sports', 'Convertible'];
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [carType,setCarType] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchedCars, setSearchedCars] = useState(null);
    const [price, setPrice] = useState(1000);
    const [year, setYear] = useState(1950);
    const [displayNormal, setDisplayNormal] = useState(true);
    const [selectedTypes, setSelectedTypes] = useState([]);

    const [filtered, setFiltered] = useState([]);

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
                console.log(data.center);
            })
            .catch(console.error);
    }, [id, csrftoken]);


    const filteredTypes = carTypes.filter((type) =>
        type.toLowerCase()
    );

    const handleSelect = (type) => {
        setCarType(type);
        setShowDropdown(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (searchInput) params.append('searchInput', searchInput);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (carType) params.append('carType', carType);
        params.append('center_id', id);
        await fetch(`http://localhost:8000/drivequest/search_cars/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then((res) => res.json())
            .then(data => {
                console.log(data);
                setSearchedCars(data);
                setDisplayNormal(false);
                setSearchInput('');
                setCarType('');
            })
            .catch(err => console.log(err));
    }

    if (!center) {
        return <div className={styles.loadingWrapper}><Loading /></div>;
    }


    const handleFilter = (carList) => {
        const filtered = carList.filter(car =>
            car.price > price ||
            car.year < year || // fails year filter
            (selectedTypes.length > 0 && !selectedTypes.includes(car.car_type)) // fails type filter
        );
        const ids = filtered.map(car => car.id);
        setFiltered(ids);
        console.log(ids);
    };

    return (
        <div className={styles.container}>
            {center ? (<div className={styles.centerContainer}>
                <div
                    className={styles.upperSection}
                >
                    <div className="w-full text-center p-2">
                        <h3 className="text-4xl text-bold mt-3">{center.name}</h3>
                        <h3 className="text-2xl mb-4">{center.country} {center.city}</h3>
                    </div>
                    <div className={styles.imageSection} style={{ backgroundImage: `url(${center.image})` }}>
                         <div className={styles.imageLeft}>
                              <h3 className="text-white p-2 text-center text-3xl lg:text-4xl">Cooling System Service
                                  We also provide high-quality cooling system repair and maintenance for all types of vehicles and cars.
                              </h3>
                         </div>
                        <div className={styles.imageRight}>
                            <h2 className="text-white mb-2 text-3xl">Search for a certain car</h2>
                            <h2 className="text-neutral-300 text-lg pb-10">Complete the form below based on your criterias</h2>
                            <div className='flex gap-4'>
                                <motion.input
                                    type="text"
                                    className="rounded-sm w-[170px] self-center lg:self-start lg:w-[190px] p-2 mb-4"
                                    placeholder="Model"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    whileFocus={{ scale: 1.02 }}
                                />
                                <motion.div
                                    className="relative"                  // make this the positioning context
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <input
                                        type="text"
                                        className="rounded-sm w-[170px] self-center lg:self-start lg:w-[190px] p-2 mb-4"
                                        placeholder="Tip mașină (ex: SUV)"
                                        value={carType}
                                        onChange={(e) => {
                                            setCarType(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                                    />

                                    {showDropdown && filteredTypes.length > 0 && (
                                        <motion.ul
                                            className={`absolute top-full left-0 mt-1 w-[190px] max-h-40 overflow-auto rounded-md shadow-lg bg-white z-10 ${styles.dropdown_list}`}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ type: 'spring', damping: 25 }}
                                        >
                                            {filteredTypes.map((type) => (
                                                <motion.li
                                                    key={type}
                                                    onClick={() => handleSelect(type)}
                                                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${styles.dropdown_item}`}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {type}
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </motion.div>
                            </div>
                            <div className='flex gap-4'>
                                <motion.input
                                    className="rounded-sm w-[170px] self-center lg:self-start lg:w-[190px] p-2 mb-4"
                                    type="date"
                                    onChange={(e) => setStartDate(e.target.value)}
                                    whileFocus={{ scale: 1.02 }}
                                />
                                <motion.input
                                    className="rounded-sm w-[170px] self-center lg:self-start lg:w-[190px] p-2 mb-4"
                                    type="date"
                                    onChange={(e) => setEndDate(e.target.value)}
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>


                            <button
                                type="submit"
                                className="bg-primary text-white py-2 rounded-lg mb-4 hover:bg-accent transition-all duration-300"
                                onClick={(e) => handleSearch(e)}
                            >
                                Caută mașină
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.lowerSection}>
                    <div className={styles.carsFilter}>
                        <h3 className="text-3xl text-bold mb-4">Filter by:</h3>
                        <div className="flex flex-col my-4">
                            {/* display the price above the slider */}
                            <span className="mb-2 text-xl font-semibold text-gray-700">
    Price per day: {price}$
  </span>

                            <input
                                id="volume"
                                type="range"
                                min="0"
                                max="1000"
                                step="1"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value))}
                                className="accent-cyan-500"
                            />
                        </div>
                        <div className="flex flex-col my-4">
                            {/* display the price above the slider */}
                            <span className="mb-2 text-xl font-semibold text-gray-700">
    Production year: {year}
  </span>

                            <input
                                id="volume"
                                type="range"
                                min="1950"
                                max="2025"
                                step="1"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="accent-cyan-500"
                            />
                        </div>
                            <p className="text-2xl text-gray-600 mb-2">Car type:</p>
                        {filteredTypes.map((type) => (
                            <div className="flex" key={type}>
                                <input
                                    className="w-6 h-6 mr-2 mb-3 color-primary"
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => {
                                        setSelectedTypes(prev =>
                                            prev.includes(type)
                                                ? prev.filter(t => t !== type)
                                                : [...prev, type]
                                        );
                                    }}
                                />
                                <p className="text-xl">{type}</p>
                            </div>
                        ))}
                        <div className="flex">
                        <button className="text-xl w-[150px] mr-3 bg-primary hover:bg-accent text-white py-2 rounded-lg mb-4 transtion-all duration-300"
                                onClick={() => handleFilter(displayNormal ? cars : searchedCars)}
                        >Apply filters</button>
                        <button className="text-xl w-[150px] bg-primary hover:bg-accent text-white py-2 rounded-lg mb-4 transtion-all duration-300"
                                onClick={() => {setFiltered([]);
                                    setPrice(1000);
                                    setYear(1950);
                                    setSelectedTypes([]);
                                    }}
                        >Reset Filters</button>
                        </div>
                        <div className="pt-4">
                            <h3 className="text-lg text-center">Our Address: {center.address} {center.city}, {center.country}</h3>
                            <MapContainer center={[center.latitude, center.longitude]} zoom={12} style={{ height: "295px", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[center.latitude, center.longitude]}>
                                    <Popup>
                                        Drivequest head center
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>


                    {(displayNormal && cars.length > 0) ? (<div className={styles.carsDisplay}>
                        <div className="flex items-center">
                            <h2 className="text-4xl font-bold mx-auto">
                                Your results
                            </h2>
                        </div>
                        <div className={styles.car_list}>
                            {cars.filter(car => !filtered.includes(car.id))
                                .map((car) => (
                                <div className={styles.carCard}
                                     key={car.id}
                                >
                                    <img
                                        src={
                                            car.image
                                                ? `http://localhost:8000${car.image}`
                                                : '/images/defaultImage.webp'
                                        }
                                        className="w-[380px] max-h-[250px] object-cover"
                                        alt={`${car.brand} ${car.model}`}
                                    />
                                    <div className="flex flex-col justify-between p-4">
                                        <h3 className="text-3xl text-bold">
                                            {car.brand} {car.model}
                                        </h3>
                                        <p className="text-xl">Price: {car.price}€/day</p>
                                        <p className="text-xl">Year: {car.year}</p>
                                        <p className="text-xl">Category: {car.car_type}</p>
                                        <p className="text-xl">Rating: {car.rating}</p>
                                        <button
                                            className="text-xl w-[200px] bg-primary hover:bg-accent transition-all duration-300 text-white py-2 rounded-lg mt-4"
                                            onClick={()=>{navigate(`/car_details/${car.id}`)}}
                                        >
                                            Închiriază
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>) :null}


                        {searchedCars ? (
                            <div className={styles.carsDisplay}>
                                <div className="flex items-center mt-2">
                                    <h2 className="text-4xl font-bold mx-auto">
                                        Your results
                                    </h2>
                                    <button className="text-xl w-[200px] bg-primary hover:bg-accent transtion-all duration-300 text-white p-2 rounded-lg"
                                            onClick={() => {setSearchedCars(null);
                                            setDisplayNormal(true);
                                            setSearchInput('');
                                            setCarType('');
                                            setPrice(0);
                                            setYear(0);
                                            }}
                                    >Clear Results</button>
                                </div>
                                <div className={styles.car_list}>
                                    {searchedCars.filter(car => !filtered.includes(car.id))
                                        .map((car) => (
                                        <div className={styles.carCard}
                                             key={car.id}
                                        >
                                            <img
                                                src={
                                                    car.image
                                                        ? `http://localhost:8000${car.image}`
                                                        : '/images/defaultImage.webp'
                                                }
                                                className="w-[380px] max-h-[250px] object-cover"
                                                alt={`${car.brand} ${car.model}`}
                                            />
                                            <div className="flex flex-col justify-between p-4">
                                                <h3 className="text-3xl text-bold">
                                                    {car.brand} {car.model}
                                                </h3>
                                                <p className="text-xl">Price: {car.price}€/day</p>
                                                <p className="text-xl">Year: {car.year}</p>
                                                <p className="text-xl">Category: {car.car_type}</p>
                                                <p className="text-xl">Rating: {car.rating}</p>
                                                <button
                                                    className="text-xl w-[200px] bg-primary hover:bg-accent transition-all duration-300 text-white py-2 rounded-lg mt-4"
                                                    onClick={()=>{navigate(`/car_details/${car.id}`)}}
                                                >
                                                    Închiriază
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                </div>
            </div> ) : null}
            <Footer />
        </div>
    );
}

export default Center;
