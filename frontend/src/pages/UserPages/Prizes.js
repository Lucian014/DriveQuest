import React, {useContext, useEffect, useState} from 'react';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/UserPages/Prizes.module.css';
import '../../App.css';
import Footer from "../../components/Footer";

function Prizes() {

    const [user, setUser] = useState(null);
    const csrftoken = useContext(CsrfContext);
    const [modal, setModal] = useState(false);
    const [leaderboard, setLeaderboard] = useState(null)
    useEffect(() => {
        fetch('http://localhost:8000/drivequest/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {setUser(data.user)
            console.log(data.user)})
    }, [])


    useEffect(() => {
        fetch('http://localhost:8000/drivequest/leaderboard/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {setLeaderboard(data)
                console.log(data)})
    }, [])


    const claimReward = async (id) => {
        const response = await fetch(`http://localhost:8000/drivequest/claim_reward/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        })
        if (response.ok) {
            setModal(true);
            setUser(user => ({...user, [`prize${id}`]: true}));
        } else{
            alert("Something went wrong");
        }
    }

    return (
        <div>
        <div className={styles.container}>
            <div className={styles.header}>
            <h1 className={"text-7xl font-bold mb-4"}>Prizes</h1>
            {user && user.points > 0 ? <p className={"text-3xl mb-2"}>You have {user.points} points available</p> : <p className={"text-3xl"}>You have no points</p>}
            </div>

            <div className={styles.prizes}>
                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Movie Night Kit</h2>
                    <p className={styles.prizeDescription}>Car + projector, snacks & screen for a drive-in vibe</p>
                    {user && user.prize1
                        ? <button className={styles.prizeButton}>Reward already claimed</button>
                        : <button className={styles.prizeButton} onClick={() => claimReward(1)}>Unlock (1000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Eco Roadtrip</h2>
                    <p className={styles.prizeDescription}>Rental + carbon offset + eco travel gear (bottle, bag)</p>
                    {user && user.prize2
                        ? <button className={styles.prizeButton}>Reward already claimed</button>
                        : <button className={styles.prizeButton} onClick={() => claimReward(2)}>Unlock (2000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Route Explorer</h2>
                    <p className={styles.prizeDescription}>Free rental with a scenic GPS tour of hidden gems</p>
                    {user && user.prize3
                        ? <button className={styles.prizeButton}>Reward already claimed</button>
                        : <button className={styles.prizeButton} onClick={() => claimReward(3)}>Unlock (3500 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Mystery Drive</h2>
                    <p className={styles.prizeDescription}>Surprise car for a weekend: convertible? electric? retro?</p>
                    {user && user.prize4
                        ? <button className={styles.prizeButton}>Reward already claimed</button>
                        : <button className={styles.prizeButton} onClick={() => claimReward(4)}>Unlock (5500 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Car Influencer</h2>
                    <p className={styles.prizeDescription}>Luxury car + professional photoshoot for your socials</p>
                    {user && user.prize5
                        ? <button className={styles.prizeButton}>Reward already claimed</button>
                        : <button className={styles.prizeButton} onClick={() => claimReward(5)}>Unlock (7500 points)</button>}
                </div>
            </div>


            <div className={styles.leaderboard}>
                <h2 className="text-4xl mb-8">🏆 <b>Leaderboard</b></h2>
                <div className={styles.table}>
                    <table>
                        <thead>
                        <tr>
                            <th>RANK</th>
                            <th>PLAYER</th>
                            <th>AVATAR</th>
                            <th>XP</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leaderboard && leaderboard.map((entry, index) => (
                            <tr key={index}>
                                <td>{entry.rank}</td>
                                <td>{entry.username}</td>
                                <td>
                                    <img
                                        src={entry.profile_picture && entry.profile_picture !== "./bestia.png" ? entry.profile_picture : "./bestia.png"}
                                        alt="Avatar"
                                    />
                                </td>
                                <td>{entry.XP}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {modal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div
                        className="rounded-2xl p-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 w-[90%] max-w-md shadow-xl">
                        <div className="bg-white rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Reward claimed successfully</h2>
                                <button
                                    onClick={() => setModal(!modal)}
                                    className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setModal(!modal)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    <Footer />
        </div>
    );
}

export default Prizes;