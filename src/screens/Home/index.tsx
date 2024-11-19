
import "./Home.css"
import logo from "../../assets/connect-logo-v2.svg"
import connect from "../../assets/connect_hero.svg";
import { v4 as uuid } from "uuid";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context";

export default function Home() {
    const navigate = useNavigate()
    const { stopCamera } = useContext<any>(SocketContext);
    const [name, setName] = useState("");


    useEffect(() => {
        const name = localStorage.getItem("name");

        if(name) setName(name);
    }, [])

    function handleUserName(e:React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
        localStorage.setItem("name", e.target.value)
    }

    useBeforeUnload(
        stopCamera()
    );


    function gotoMeetingScreen() {
        const uid = uuid()
        navigate(`/call/${uid}`, {state: {initiate: true}});
    }

    return (
        <div>
            <section className="header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <img src={logo} alt="Free video call service" className="logo" />

                    <div className="username-container">
                        <input value={name}  className="u-input-field" type="text" id="input-name" placeholder="Enter user name" onChange={handleUserName} />
                        <label htmlFor="input-name" className="u-input-label">User Name</label>
                        <span className="u-input-highlight"></span>
                    </div>
                </div>
                <div className="line" />
            </section>

            <section className="hero">
                <div>
                    <h3>Video calls and meeting for everyone</h3>
                    <div className="input-container">
                        <button className="hero_btn" onClick={gotoMeetingScreen}>New Meeting</button>
                        <div>
                            <input className="input-field" placeholder="Enter a code or link" />
                            <button className="hero_btn">Join Meeting</button>
                        </div>
                    </div>
                </div>
                <div>
                    <img className="hero-image" src={connect} alt="Video calls and meeting for everyone" />
                </div>
            </section>
        </div>
    )
}