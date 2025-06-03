import React, { useContext, useState, useEffect } from 'react';
import '../../App.css';
import CsrfContext from '../../components/CsrfContext';
import Loading from '../../components/Loading';

function Admin() {
    const [searchType, setSearchType] = useState('car');
    const [searchInput, setSearchInput] = useState('');
    const [car, setCar] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [cars, setCars] = useState([]);
    const [centers, setCenters] = useState([]);
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch cars and centers in parallel; set loading false once both done
    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/drivequest/cars', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            }).then(res => res.json()),
            fetch('http://localhost:8000/drivequest/get_centers/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            }).then(res => res.json()),
        ])
            .then(([carsData, centersData]) => {
                setCars(carsData);
                setCenters(centersData);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [csrftoken]);

    const handleCarSelect = e => {
        const selectedId = e.target.value;
        const selectedCarObj = cars.find(c => c.id.toString() === selectedId);

        if (!selectedCarObj) {
            setCar(null);
            return;
        }
        const matchingCenter = centers.find(c => c.id === selectedCarObj.center);

        setCar({
            ...selectedCarObj,
            center: matchingCenter || null,
            image: selectedCarObj.image || null,
        });
    };

    const handleCenterSelect = e => {
        const selectedId = e.target.value;
        const selectedCenterObj = centers.find(c => c.id.toString() === selectedId);
        if (!selectedCenterObj) {
            setCenter(null);
            return;
        }
        setCenter({
            ...selectedCenterObj,
            image: selectedCenterObj.image || null,
        });
    };

    const handleSaveCar = () => {
        if (!car) return;

        const formData = new FormData();
        formData.append('brand', car.brand);
        formData.append('model', car.model);
        formData.append('year', car.year);
        formData.append('price', car.price);
        formData.append('center', car.center.id);

        if (car.image instanceof File) {
            formData.append('image', car.image);
        }

        fetch(`http://localhost:8000/drivequest/save_car/${car.id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: formData,
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                setCar(prev => ({
                    ...prev,
                    brand: data.brand,
                    model: data.model,
                    year: data.year,
                    price: data.price,
                    image: data.image,
                    center: prev.center,
                }));
            })
            .catch(err => console.error('Save failed:', err));
    };

    const handleSaveCenter = () => {
        if (!center) return;

        const formData = new FormData();
        formData.append('name', center.name);
        formData.append('address', center.address);
        formData.append('city', center.city);
        formData.append('country', center.country);
        formData.append('phone', center.phone);
        formData.append('latitude', center.latitude);
        formData.append('longitude', center.longitude);

        if (center.image instanceof File) {
            formData.append('image', center.image);
        }

        fetch(`http://localhost:8000/drivequest/save_center/${center.id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: formData,
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                setCenter(prev => ({
                    ...prev,
                    name: data.name,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                    phone: data.phone,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    image: data.image,
                }));
            })
            .catch(err => console.error('Save failed:', err));
    };

    if (loading) return <Loading />;

    return (
        <div className="bg-[var(--color-bg)] min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Buttons */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        className={`flex-1 text-lg font-medium py-2 rounded-lg transition ${
                            searchType === 'car'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)]'
                        }`}
                        onClick={() => {
                            setSearchType('car');
                            setCar(null);
                            setSearchInput('');
                        }}
                    >
                        Edit Car Data
                    </button>
                    <button
                        className={`flex-1 text-lg font-medium py-2 rounded-lg transition ${
                            searchType === 'center'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)]'
                        }`}
                        onClick={() => {
                            setSearchType('center');
                            setCenter(null);
                            setSearchInput('');
                        }}
                    >
                        Edit Center Data
                    </button>
                </div>

                {/* CAR SECTION */}
                {searchType === 'car' && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">Car Management</h2>

                        {/* Search + Select Car */}
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
                            <label className="sr-only">Filter Cars</label>
                            <input
                                type="text"
                                placeholder="Filter cars..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="flex-1 mb-3 md:mb-0 border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                            />

                            <label className="sr-only">Select Car</label>
                            <select
                                onChange={handleCarSelect}
                                value={car?.id || ''}
                                className="flex-1 border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                            >
                                <option value="">-- Select Car --</option>
                                {[...new Map(
                                    cars
                                        .filter(c =>
                                            `${c.brand} ${c.model}`.toLowerCase().includes(searchInput.toLowerCase())
                                        )
                                        .map(c => [`${c.brand} ${c.model}`, c])
                                ).values()]
                                    .sort((a, b) => a.model.localeCompare(b.model))
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.brand} {c.model}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Car Edit Card */}
                        {car && (
                            <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 border border-[var(--color-muted)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Brand</label>
                                        <input
                                            type="text"
                                            value={car.brand}
                                            onChange={e => setCar(prev => ({ ...prev, brand: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Model</label>
                                        <input
                                            type="text"
                                            value={car.model}
                                            onChange={e => setCar(prev => ({ ...prev, model: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Year</label>
                                        <input
                                            type="text"
                                            value={car.year}
                                            onChange={e => setCar(prev => ({ ...prev, year: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Price</label>
                                        <input
                                            type="text"
                                            value={car.price}
                                            onChange={e => setCar(prev => ({ ...prev, price: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                </div>

                                {/* Display or Upload Image */}
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                                    {car.image && typeof car.image === 'string' && (
                                        <img
                                            src={`http://localhost:8000${car.image}`}
                                            alt="Car"
                                            className="object-cover h-40 w-full md:w-[250px] rounded-lg mb-4 md:mb-0 border border-[var(--color-muted)]"
                                        />
                                    )}
                                    <div className="w-full">
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Upload Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCar(prev => ({ ...prev, image: e.target.files[0] }));
                                                }
                                            }}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                </div>

                                {/* Select Center */}
                                <div>
                                    <label className="block mb-1 text-[var(--color-text)] font-medium">Center</label>
                                    <select
                                        value={car.center?.id || ''}
                                        onChange={e => {
                                            const newCenterId = e.target.value;
                                            const newCenter = centers.find(c => c.id.toString() === newCenterId) || null;
                                            setCar(prev => ({ ...prev, center: newCenter }));
                                        }}
                                        className="block w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                    >
                                        <option value="">-- Select Center --</option>
                                        {centers.map(center => (
                                            <option key={center.id} value={center.id}>
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveCar}
                                    className="w-full bg-[var(--color-primary)] text-white font-medium rounded-lg py-2 hover:bg-[var(--color-accent)] transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* CENTER SECTION */}
                {searchType === 'center' && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">Center Management</h2>

                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
                            <label className="sr-only">Filter Centers</label>
                            <input
                                type="text"
                                placeholder="Filter centers..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="flex-1 mb-3 md:mb-0 border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                            />

                            <label className="sr-only">Select Center</label>
                            <select
                                onChange={handleCenterSelect}
                                value={center?.id || ''}
                                className="flex-1 border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                            >
                                <option value="">-- Select Center --</option>
                                {[...new Map(
                                    centers
                                        .filter(c => c.name.toLowerCase().includes(searchInput.toLowerCase()))
                                        .map(c => [c.name, c])
                                ).values()]
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {center && (
                            <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 border border-[var(--color-muted)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Name</label>
                                        <input
                                            type="text"
                                            value={center.name}
                                            onChange={e => setCenter(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Address</label>
                                        <input
                                            type="text"
                                            value={center.address}
                                            onChange={e => setCenter(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">City</label>
                                        <input
                                            type="text"
                                            value={center.city}
                                            onChange={e => setCenter(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Country</label>
                                        <input
                                            type="text"
                                            value={center.country}
                                            onChange={e => setCenter(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Phone</label>
                                        <input
                                            type="text"
                                            value={center.phone}
                                            onChange={e => setCenter(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Latitude</label>
                                        <input
                                            type="text"
                                            value={center.latitude}
                                            onChange={e => setCenter(prev => ({ ...prev, latitude: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Latitude"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Longitude</label>
                                        <input
                                            type="text"
                                            value={center.longitude}
                                            onChange={e => setCenter(prev => ({ ...prev, longitude: e.target.value }))}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                            placeholder="Longitude"
                                        />
                                    </div>
                                </div>

                                {/* Display or Upload Center Image */}
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                                    {center.image && typeof center.image === 'string' && (
                                        <img
                                            src={center.image}
                                            alt="Center"
                                            className="object-cover h-40 w-full md:w-[250px] rounded-lg mb-4 md:mb-0 border border-[var(--color-muted)]"
                                        />
                                    )}
                                    <div className="w-full">
                                        <label className="block mb-1 text-[var(--color-text)] font-medium">Upload Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCenter(prev => ({ ...prev, image: e.target.files[0] }));
                                                }
                                            }}
                                            className="w-full border border-[var(--color-muted)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)]"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCenter}
                                    className="w-full bg-[var(--color-primary)] text-white font-medium rounded-lg py-2 hover:bg-[var(--color-accent)] transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;
