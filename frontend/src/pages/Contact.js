import React, {useContext, useState} from 'react';
import Navbar from "../components/Navbar";
import CsrfContext from "./CsrfContext";


function Contact() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const csrftoken = useContext(CsrfContext);


    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            title: title,
            message: content,
            phone: phoneNumber,
        }
        fetch('http://localhost:8000/drivequest/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                alert(data.message);
            })
            .catch(error => {
                console.log(error);
            });
        setTitle('');
        setContent('');
        setPhoneNumber('');
    };

    return (
        <div>
            <h1>Contact Page</h1>
            <form onSubmit={handleSubmit} >
                <input
                    type="text"
                    placeholder="Title.."
                    value={title}
                    required
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Content.."
                    value={content}
                    required
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Phone Number.."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button type="submit">Confirm message</button>
            </form>
        </div>
    );
}

export default Contact;