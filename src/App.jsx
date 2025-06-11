import React, { useEffect, useRef, useState } from "react";


export default function App() {
    const [roomid, setroomid] = useState()
    const [ws, setws] = useState()
    const [f, setf] = useState(true)
    const roomidref = useRef()
    const [name, setname] = useState()

    function catchname(e) {
        setname(e.target.value)
    }
    function createroom() {
        let str = "G9JZplNsnmxrXTz73K1S8YcRiL0WDuByPVehgoqQUM5aAb6dET"
        let id = "";
        for (let index = 0; index < 5; index++) {
            id += str[Math.floor(Math.random() * str.length)]
        }
        setroomid(id)
        roomidref.current.value = id
        navigator.clipboard.writeText(id)
        alert(`room-id  ${id}copied to clipboard`)
    }

    function joinroom() {
        setf(false)
        let enteredroomid = roomidref.current.value
        const roominfo = {
            type: "join",
            username: name,
            roomid: enteredroomid
        }

        if (!name) {
            alert("please enter your name")
            setf(true)
            return
        }
        const ws = new WebSocket("ws://localhost:8080")
        setws(ws)
        ws.onopen = () => {
            ws.send(JSON.stringify(roominfo))
        }
        ws.onerror = (e) => {
            console.log("error", e);
        }
        ws.onmessage = (e) => {
            console.log("messgae from server", e.data);
        }
    }
    return (
        <>
            {f ? (<div>
                <input type="text" placeholder="enter name" onChange={catchname} />
                <button onClick={createroom}>create room</button><br />
                <input type="text" placeholder="enter room id" ref={roomidref} />
                <button onClick={joinroom}>join room</button>
            </div>) : <Room ws={ws} name={name} />}
        </>
    )
}


function Room({ ws, name }) {
    const msgref = useRef()
    const [message, setmessages] = useState([])
    function sendmessage() {
        let msg = msgref.current.value
        const chatinfo = {
            type: "chat",
            message: msg,
            username: name
        }
        ws.send(JSON.stringify(chatinfo))
        setmessages((prev) => [...prev, `${name}:-${msg}`])
        msgref.current.value = ""
    }
    useEffect(() => {  //agar naya ws connection hoga to yeh handle karega
        if (!ws) return;

        const handler = (e) => {
            const parsed = JSON.parse(e.data);
            if (parsed.type === "chat" || parsed.type === "notification") {
                setmessages(prev => [...prev, `${parsed.name||'🔔'}:${parsed.msg || parsed.notify}`]);
            }
        };

        ws.addEventListener("message", handler);

        return () => ws.removeEventListener("message", handler);
    }, [ws]);

    return (
        <>
            <div>
                <input type="text" placeholder="enter your message" ref={msgref} />
                <button onClick={sendmessage} >send</button>
                <div>
                    {message.map((m, i) =>
                        <p key={i}>{m}</p>
                    )}
                </div>
            </div>
        </>
    )
}