import React, {useContext, useEffect, useState} from 'react';
import CsrfContext from "../../components/CsrfContext";
import styles from '../../styles/UserPages/Prizes.module.css';
import '../../App.css';

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
        <div className={styles.container}>
            <div className={styles.header}>
            <h1 className={"text-7xl font-bold mb-4"}>Prizes</h1>
            {user && user.points > 0 ? <p className={"text-3xl mb-2"}>You have {user.points} points available</p> : <p className={"text-3xl"}>You have no points</p>}
            </div>

            <div className={styles.prizes}>
                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>First Prize</h2>
                    <p className={styles.prizeDescription}>Win a luxurious weekend getaway with all expenses covered</p>
                    {user && user.prize1 ? <button className={styles.prizeButton}>Reward already claimed</button> : <button className={styles.prizeButton} onClick={()=>claimReward(1)}>Unlock (1000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Second Prize</h2>
                    <p className={styles.prizeDescription}>Win a luxurious weekend getaway with all expenses covered</p>
                    {user && user.prize2 ? <button className={styles.prizeButton}>Reward already claimed</button> : <button className={styles.prizeButton} onClick={()=>claimReward(2)}>Unlock (1000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Third Prize</h2>
                    <p className={styles.prizeDescription}>Win a luxurious weekend getaway with all expenses covered</p>
                    {user && user.prize3 ? <button className={styles.prizeButton}>Reward already claimed</button> : <button className={styles.prizeButton} onClick={()=>claimReward(3)}>Unlock (1000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Fourth Prize</h2>
                    <p className={styles.prizeDescription}>Win a luxurious weekend getaway with all expenses covered</p>
                    {user && user.prize4 ? <button className={styles.prizeButton}>Reward already claimed</button> : <button className={styles.prizeButton} onClick={()=>claimReward(4)}>Unlock (1000 points)</button>}
                </div>

                <div className={styles.prize}>
                    <h2 className={styles.prizeTitle}>Fifth Prize</h2>
                    <p className={styles.prizeDescription}>Win a luxurious weekend getaway with all expenses covered</p>
                    {user && user.prize5 ? <button className={styles.prizeButton}>Reward already claimed</button> : <button className={styles.prizeButton} onClick={()=>claimReward(5)}>Unlock (1000 points)</button>}
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



            {modal && <div className="modal">
                <p>Reward claimed successfully</p>
                <button onClick={()=>setModal(false)}>Close</button>
            </div>}
        </div>
    );
}

export default Prizes;